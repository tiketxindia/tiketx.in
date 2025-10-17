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
  scheduledTime?: string; // ISO timestamp for verification
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

    const { filmId, scheduledTime }: RequestBody = await req.json();

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

    console.log(`Publishing film ${filmId} at scheduled time: ${scheduledTime}`);

    // Get the film details first
    const { data: film, error: fetchError } = await supabaseClient
      .from('films')
      .select('id, title, is_published, scheduled_release_datetime')
      .eq('id', filmId)
      .single();

    if (fetchError || !film) {
      console.error('Film not found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Film not found', details: fetchError }),
        { 
          status: 404,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Check if film is already published
    if (film.is_published) {
      console.log(`Film ${filmId} (${film.title}) is already published`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Film is already published', 
          film: film 
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

    // Verify this is the right time (optional safety check)
    const now = new Date();
    const scheduledDateTime = new Date(film.scheduled_release_datetime);
    
    // Allow some leeway (5 minutes) for scheduling precision
    const timeDiff = Math.abs(now.getTime() - scheduledDateTime.getTime());
    const fiveMinutes = 5 * 60 * 1000;
    
    if (timeDiff > fiveMinutes) {
      console.warn(`Time mismatch for film ${filmId}: scheduled for ${scheduledDateTime.toISOString()}, running at ${now.toISOString()}`);
      // Still proceed, but log the warning
    }

    // Publish the film and clear the scheduled_release_datetime
    const { data: updatedFilm, error: updateError } = await supabaseClient
      .from('films')
      .update({ 
        is_published: true,
        scheduled_release_datetime: null, // Clear since the scheduling job is now complete
        modified_date: now.toISOString()
      })
      .eq('id', filmId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to publish film:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to publish film', details: updateError }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Log the publication event to audit trail
    const { error: auditError } = await supabaseClient
      .from('film_events')
      .insert({
        film_id: filmId,
        action: 'published',
        event_datetime: now.toISOString(),
        scheduled_for: film.scheduled_release_datetime,
        metadata: {
          film_title: film.title,
          published_via: 'scheduled_edge_function'
        }
      });

    if (auditError) {
      console.error('Failed to log publication event:', auditError);
      // Don't fail the request, just log the error
    }

    console.log(`Successfully published film: ${updatedFilm.title} (ID: ${filmId})`);

    // Send realtime notification
    const realtimePayload = {
      type: 'film_published',
      film: updatedFilm,
      published_at: now.toISOString()
    };

    // Use Supabase Realtime to broadcast the change
    await supabaseClient.channel('film_updates').send({
      type: 'broadcast',
      event: 'film_published',
      payload: realtimePayload
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Film "${updatedFilm.title}" has been published successfully`,
        film: updatedFilm,
        published_at: now.toISOString()
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
    console.error('Scheduled publish function error:', error);
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