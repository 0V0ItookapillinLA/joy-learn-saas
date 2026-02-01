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
  simulateMode?: boolean;
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    video: "视频",
    document: "文档",
    article: "文章",
    practice: "练习",
  };
  return labels[type] || type;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const JINGME_APP_KEY = Deno.env.get("JINGME_APP_KEY");
    const JINGME_APP_SECRET = Deno.env.get("JINGME_APP_SECRET");

    const body: TaskRequest = await req.json();
    const { students, knowledgeItems, taskTitle, taskMessage, simulateMode } = body;

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
`.trim();

    // If credentials not configured or simulate mode, return simulated success
    if (!JINGME_APP_KEY || !JINGME_APP_SECRET || simulateMode) {
      console.log("Running in simulation mode - no actual messages sent");
      console.log("Message content:", messageContent);
      console.log("Target students:", students.map(s => s.name).join(", "));

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return new Response(
        JSON.stringify({
          success: true,
          simulated: true,
          message: `模拟发送成功：已向 ${students.length} 位学员发送任务`,
          messagePreview: messageContent,
          results: students.map(s => ({ studentId: s.id, studentName: s.name, success: true })),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Real JingME API integration
    let accessToken: string;
    
    try {
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

      const tokenText = await tokenResponse.text();
      
      // Check if response is HTML (error page)
      if (tokenText.trim().startsWith("<!DOCTYPE") || tokenText.trim().startsWith("<html")) {
        console.error("JingME OAuth returned HTML instead of JSON:", tokenText.substring(0, 200));
        throw new Error("京ME认证服务返回异常，请检查API配置");
      }

      let tokenData;
      try {
        tokenData = JSON.parse(tokenText);
      } catch {
        console.error("Failed to parse token response:", tokenText.substring(0, 200));
        throw new Error("京ME认证响应格式错误");
      }

      if (!tokenData.access_token) {
        console.error("No access_token in response:", tokenData);
        throw new Error(tokenData.error_description || tokenData.error || "获取访问令牌失败");
      }

      accessToken = tokenData.access_token;
    } catch (error) {
      console.error("JingME token error:", error);
      throw new Error(`京ME认证失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }

    // Send message to each student
    const results = [];
    for (const student of students) {
      try {
        const sendResponse = await fetch("https://api.jd.com/jingme/message/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            touser: student.employeeId,
            msgtype: "text",
            text: {
              content: messageContent,
            },
          }),
        });

        const sendText = await sendResponse.text();
        
        // Check for HTML response
        if (sendText.trim().startsWith("<!DOCTYPE") || sendText.trim().startsWith("<html")) {
          console.error(`Send to ${student.employeeId} returned HTML:`, sendText.substring(0, 200));
          results.push({ studentId: student.id, success: false, error: "API返回异常" });
          continue;
        }

        let sendData;
        try {
          sendData = JSON.parse(sendText);
        } catch {
          results.push({ studentId: student.id, success: false, error: "响应格式错误" });
          continue;
        }

        if (sendResponse.ok && sendData.errcode === 0) {
          results.push({ studentId: student.id, success: true });
        } else {
          results.push({ 
            studentId: student.id, 
            success: false, 
            error: sendData.errmsg || sendData.error || "发送失败" 
          });
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
        error: error instanceof Error ? error.message : "发送任务失败",
      }),
      {
        status: 200, // Return 200 with error in body for better client handling
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
