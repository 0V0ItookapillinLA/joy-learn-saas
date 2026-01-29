import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Form, Input, Button, Tabs, Card, Typography, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone, LoadingOutlined } from "@ant-design/icons";
import { GraduationCap } from "lucide-react";

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

interface SignupFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm<LoginFormValues>();
  const [signupForm] = Form.useForm<SignupFormValues>();

  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (!authLoading && user) {
    navigate("/", { replace: true });
    return null;
  }

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    const { error } = await signIn(values.email, values.password);
    setLoading(false);

    if (error) {
      let errorMessage = "登录失败，请重试";
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "邮箱或密码错误";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "请先验证您的邮箱";
      }
      message.error(errorMessage);
    } else {
      message.success("登录成功，欢迎回来！");
      navigate("/dashboard");
    }
  };

  const handleSignup = async (values: SignupFormValues) => {
    setLoading(true);
    const { error } = await signUp(values.email, values.password, values.fullName);
    setLoading(false);

    if (error) {
      let errorMessage = "注册失败，请重试";
      if (error.message.includes("User already registered")) {
        errorMessage = "该邮箱已被注册";
      }
      message.error(errorMessage);
    } else {
      message.success("注册成功，欢迎加入 JoyLearning！");
      navigate("/dashboard");
    }
  };

  const tabItems = [
    {
      key: "login",
      label: "登录",
      children: (
        <Form
          form={loginForm}
          layout="vertical"
          onFinish={handleLogin}
          autoComplete="off"
          requiredMark={false}
        >
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效的邮箱地址" },
            ]}
          >
            <Input placeholder="请输入邮箱" size="large" disabled={loading} />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码至少需要6个字符" },
            ]}
          >
            <Input.Password
              placeholder="请输入密码"
              size="large"
              disabled={loading}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "signup",
      label: "注册",
      children: (
        <Form
          form={signupForm}
          layout="vertical"
          onFinish={handleSignup}
          autoComplete="off"
          requiredMark={false}
        >
          <Form.Item
            label="姓名"
            name="fullName"
            rules={[
              { required: true, message: "请输入姓名" },
              { min: 2, message: "姓名至少需要2个字符" },
              { max: 50, message: "姓名不能超过50个字符" },
            ]}
          >
            <Input placeholder="请输入姓名" size="large" disabled={loading} />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效的邮箱地址" },
            ]}
          >
            <Input placeholder="请输入邮箱" size="large" disabled={loading} />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码至少需要6个字符" },
            ]}
          >
            <Input.Password
              placeholder="请输入密码（至少6位）"
              size="large"
              disabled={loading}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请再次输入密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="请再次输入密码"
              size="large"
              disabled={loading}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              注册
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <Title level={3} style={{ marginBottom: 4 }}>
            JoyLearning
          </Title>
          <Text type="secondary">AI智能培训管理平台</Text>
        </div>

        <Card className="shadow-xl">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            centered
          />
        </Card>

        <Text type="secondary" className="mt-6 block text-center text-sm">
          登录即表示您同意我们的服务条款和隐私政策
        </Text>
      </div>
    </div>
  );
}
