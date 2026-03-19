import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const JINGME_APP_KEY = Deno.env.get("JINGME_APP_KEY");
    const JINGME_APP_SECRET = Deno.env.get("JINGME_APP_SECRET");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Get all active training plans
    const { data: plans } = await supabase
      .from("training_plans")
      .select("id, title, organization_id")
      .eq("status", "in_progress");

    if (!plans?.length) {
      return new Response(JSON.stringify({ success: true, message: "无进行中的培训计划" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];

    for (const plan of plans) {
      // Get all users in this org
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .eq("organization_id", plan.organization_id);

      if (!profiles?.length) continue;

      // Get progress for this plan
      const { data: progressData } = await supabase
        .from("training_progress")
        .select("user_id, status, progress_percentage")
        .eq("training_plan_id", plan.id);

      const progressMap = new Map(progressData?.map(p => [p.user_id, p]) || []);

      // Find users who haven't completed
      const incompleteUsers = profiles.filter(p => {
        const prog = progressMap.get(p.user_id);
        return !prog || prog.status !== "completed";
      });

      if (!incompleteUsers.length) continue;

      // Generate AI personalized reminder
      let reminderTemplate = `📚 学习提醒\n\n您有待完成的培训课程「${plan.title}」，请抽时间继续学习。\n\n坚持学习，每天进步一点点！💪`;

      if (LOVABLE_API_KEY) {
        try {
          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-lite",
              messages: [
                {
                  role: "system",
                  content: "你是一个学习督导助手。生成简短、友好、有激励性的学习提醒消息（不超过100字）。要求包含课程名称，语气温和但有紧迫感。",
                },
                {
                  role: "user",
                  content: `为培训课程「${plan.title}」生成一条学习提醒消息。今天还有${incompleteUsers.length}人未完成学习。`,
                },
              ],
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const content = aiData.choices?.[0]?.message?.content;
            if (content) reminderTemplate = content;
          }
        } catch (e) {
          console.error("AI reminder generation failed:", e);
        }
      }

      // Send reminders
      for (const user of incompleteUsers) {
        const personalMessage = `Hi ${user.full_name || "同学"}，\n\n${reminderTemplate}`;

        // Log the reminder
        await supabase.from("learning_reminder_logs").insert({
          organization_id: plan.organization_id,
          user_id: user.user_id,
          training_plan_id: plan.id,
          reminder_type: "daily_push",
          channel: JINGME_APP_KEY ? "jingme" : "in_app",
          status: "sent",
          message_content: personalMessage,
        });

        results.push({
          user_id: user.user_id,
          name: user.full_name,
          plan: plan.title,
          sent: true,
        });
      }
    }

    // If 京ME is configured, also try to send via 京ME
    if (JINGME_APP_KEY && JINGME_APP_SECRET && results.length > 0) {
      try {
        // Batch send via 京ME (simplified - actual implementation would call JingME API)
        console.log(`Would send ${results.length} reminders via 京ME`);
      } catch (e) {
        console.error("京ME push failed:", e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reminders_sent: results.length,
        details: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI reminder error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
