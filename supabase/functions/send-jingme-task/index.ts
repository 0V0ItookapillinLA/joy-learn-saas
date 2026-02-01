import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Student {
  id: string;
  name: string;
  employeeId: string;
  department: string;
}

interface KnowledgeItem {
  id: string;
  title: string;
  type: string;
  duration?: number;
  description?: string;
}

interface TaskRequest {
  students: Student[];
  knowledgeItems: KnowledgeItem[];
  taskTitle: string;
  taskMessage?: string;
  deadline?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const JINGME_APP_KEY = Deno.env.get("JINGME_APP_KEY");
    const JINGME_APP_SECRET = Deno.env.get("JINGME_APP_SECRET");

    if (!JINGME_APP_KEY || !JINGME_APP_SECRET) {
      throw new Error("京ME API credentials not configured");
    }

    const body: TaskRequest = await req.json();
    const { students, knowledgeItems, taskTitle, taskMessage } = body;

    if (!students || students.length === 0) {
      throw new Error("No students specified");
    }

    if (!knowledgeItems || knowledgeItems.length === 0) {
      throw new Error("No knowledge items selected");
    }

    // Build message content
    const knowledgeList = knowledgeItems
      .map((k, i) => `${i + 1}. 【${getTypeLabel(k.type)}】${k.title}${k.duration ? ` (${k.duration}分钟)` : ""}`)
      .join("\n");

    const messageContent = `
📚 ${taskTitle}

${taskMessage ? `💬 ${taskMessage}\n` : ""}
请完成以下学习内容：
${knowledgeList}

点击查看详情并开始学习 👇
`;

    // Get access token from JingME
    const tokenResponse = await fetch("https://api.jd.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: JINGME_APP_KEY,
        client_secret: JINGME_APP_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error("JingME token error:", tokenError);
      throw new Error(`Failed to get JingME access token: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Send message to each student
    const results = [];
    for (const student of students) {
      try {
        // JingME message API (example endpoint - adjust based on actual API docs)
        const sendResponse = await fetch("https://api.jd.com/jingme/message/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            touser: student.employeeId, // Use employee ID as JingME user identifier
            msgtype: "text",
            text: {
              content: messageContent.trim(),
            },
            // Optional: include link card for better UX
            link: {
              title: taskTitle,
              description: `包含 ${knowledgeItems.length} 项学习内容`,
              url: `${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app")}/trainees/growth-map`,
              picurl: "",
            },
          }),
        });

        if (sendResponse.ok) {
          results.push({ studentId: student.id, success: true });
        } else {
          const errorText = await sendResponse.text();
          console.error(`Failed to send to ${student.employeeId}:`, errorText);
          results.push({ studentId: student.id, success: false, error: errorText });
        }
      } catch (err) {
        console.error(`Error sending to ${student.employeeId}:`, err);
        results.push({ studentId: student.id, success: false, error: String(err) });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        message: `成功发送 ${successCount}/${students.length} 条消息`,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Send JingME task error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    video: "视频",
    document: "文档",
    article: "文章",
    practice: "练习",
  };
  return labels[type] || type;
}
