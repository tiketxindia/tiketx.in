import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

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

    // Publish the film
    const { data: updatedFilm, error: updateError } = await supabaseClient
      .from('films')
      .update({ 
        is_published: true,
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
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
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