// supabase/functions/get-mux-signed-url/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const muxSigningKeyId = Deno.env.get("MUX_SIGNING_KEY_ID");
const muxSigningPrivateKey = Deno.env.get("MUX_SIGNING_PRIVATE_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function base64url(input) {
  return btoa(String.fromCharCode(...input)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function signJwt(payload, keyId, privateKeyBase64) {
  const header = {
    alg: "RS256",
    typ: "JWT",
    kid: keyId
  };
  const enc = new TextEncoder();
  const headerB64 = base64url(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64url(enc.encode(JSON.stringify(payload)));
  const data = `${headerB64}.${payloadB64}`;
  // Import the private key (base64 string, no PEM)
  const keyBuf = Uint8Array.from(atob(privateKeyBase64), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuf.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  // Sign
  const sig = new Uint8Array(await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    enc.encode(data)
  ));
  const sigB64 = base64url(sig);
  return `${data}.${sigB64}`;
}

function getMuxSignedPlaybackUrl(playbackId, keyId, privateKey, opts = {}) {
  const exp = opts.exp || Math.floor(Date.now() / 1000) + 5 * 60; // 5 min default
  const payload = {
    exp,
    sub: playbackId,
    aud: "v"
  };
  return signJwt(payload, keyId, privateKey).then((token)=>`https://stream.mux.com/${playbackId}.m3u8?token=${token}`);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { film_id, playback_id } = await req.json();
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !user) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    // Check for valid ticket
    const { data: tickets, error: ticketError } = await supabase.from("film_tickets").select("id, expiry_date").eq("user_id", user.id).eq("film_id", film_id).order("purchase_date", { ascending: false }).limit(1);
    if (ticketError || !tickets || tickets.length === 0) return new Response("No valid ticket", { status: 403, headers: corsHeaders });
    const ticket = tickets[0];
    if (!ticket.expiry_date || new Date(ticket.expiry_date) < new Date()) {
      return new Response("Ticket expired", { status: 403, headers: corsHeaders });
    }
    // Generate signed Mux playback URL using Deno crypto
    const signedUrl = await getMuxSignedPlaybackUrl(playback_id, muxSigningKeyId, muxSigningPrivateKey);
    return new Response(JSON.stringify({ signedUrl }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response("Error: " + err.message, { status: 500, headers: corsHeaders });
  }
}); 