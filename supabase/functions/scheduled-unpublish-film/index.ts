// @deno-types="jsr:@supabase/functions-js/edge-runtime.d.ts"
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// @ts-ignore - JSR imports are valid in Deno runtime
import { createClient } from "jsr:@supabase/supabase-js@2";

// Type definitions for Deno globals (for VS Code IntelliSense)
declare global {
  namespace Deno {
    export function serve(handler: (request: Request) => Response | Promise<Response>): void;
    export namespace env {
      export function get(key: string): string | undefined;
    }
  }
}

interface RequestBody {
  filmId: string;
  closureDate?: string; // ISO date string for verification
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { filmId, closureDate }: RequestBody = await req.json();

    if (!filmId) {
      return new Response(
        JSON.stringify({ error: 'Film ID is required' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Get film details
    const { data: film, error: fetchError } = await supabaseClient
      .from('films')
      .select('id, title, is_published, closure_expiry_date')
      .eq('id', filmId)
      .single();

    if (fetchError || !film) {
      console.error('Film not found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Film not found' }),
        { 
          status: 404,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Check if film is already unpublished
    if (!film.is_published) {
      console.log(`Film ${filmId} is already unpublished`);
      return new Response(
        JSON.stringify({ 
          message: 'Film is already unpublished',
          filmId: filmId,
          title: film.title
        }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Verify closure date if provided
    if (closureDate && film.closure_expiry_date) {
      const providedDate = new Date(closureDate).toISOString().split('T')[0];
      const filmClosureDate = new Date(film.closure_expiry_date).toISOString().split('T')[0];
      
      if (providedDate !== filmClosureDate) {
        console.warn(`Closure date mismatch for film ${filmId}. Expected: ${filmClosureDate}, Got: ${providedDate}`);
      }
    }

    // Check if closure date has been reached
    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0];
    const closureExpiryDate = film.closure_expiry_date;

    if (closureExpiryDate) {
      const closureDateString = new Date(closureExpiryDate).toISOString().split('T')[0];
      
      if (todayDateString < closureDateString) {
        console.log(`Film ${filmId} closure date (${closureDateString}) has not been reached yet. Today: ${todayDateString}`);
        return new Response(
          JSON.stringify({ 
            message: 'Closure date not yet reached',
            filmId: filmId,
            title: film.title,
            closureDate: closureDateString,
            today: todayDateString
          }),
          { 
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      }
    }

    // Unpublish the film and clear the closure_expiry_date
    const { error: updateError } = await supabaseClient
      .from('films')
      .update({ 
        is_published: false,
        closure_expiry_date: null, // Clear since the closure job is now complete
        modified_date: today.toISOString()
      })
      .eq('id', filmId);

    if (updateError) {
      console.error('Failed to unpublish film:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to unpublish film', details: updateError.message }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Log the closure event to audit trail
    const { error: auditError } = await supabaseClient
      .from('film_events')
      .insert({
        film_id: filmId,
        action: 'closed',
        event_datetime: today.toISOString(),
        scheduled_for: film.closure_expiry_date,
        metadata: {
          film_title: film.title,
          closed_via: 'scheduled_edge_function'
        }
      });

    if (auditError) {
      console.error('Failed to log closure event:', auditError);
      // Don't fail the request, just log the error
    }

    console.log(`Successfully unpublished film: ${film.title} (${filmId}) on closure date: ${closureExpiryDate}`);

    // Send Realtime notification about film closure
    const channel = supabaseClient.channel('film_closures');
    await channel.send({
      type: 'broadcast',
      event: 'film_closed',
      payload: {
        filmId: filmId,
        title: film.title,
        closureDate: closureExpiryDate,
        timestamp: new Date().toISOString()
      }
    });

    return new Response(
      JSON.stringify({ 
        message: 'Film successfully unpublished',
        filmId: filmId,
        title: film.title,
        closureDate: closureExpiryDate,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error) {
    console.error('Scheduled unpublish function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: errorMessage 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
});