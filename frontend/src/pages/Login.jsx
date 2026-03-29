import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  Layout,
  Row,
  Col,
  Typography,
  Card,
  Form,
  Input,
  Button,
  Space,
  App,
} from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;
const { Content } = Layout;

const BRAND      = "#C4856A";
const LIGHT_BG   = "#F5F0E8";
const CARD_BG    = "#EDE4D8";
const BORDER     = "rgba(44,36,32,0.12)";
const TEXT_MAIN  = "#2C2420";
const TEXT_MUTED = "rgba(44,36,32,0.5)";

const pageStyle = {
  minHeight: "100vh",
  background: LIGHT_BG,
  fontFamily: "'DM Sans', sans-serif",
};

const brandCardStyle = {
  height: "100%",
  minHeight: 520,
  background: `linear-gradient(145deg, ${BRAND} 0%, #2C2420 100%)`,
  border: "none",
  borderRadius: 20,
};

const brandCardBodyStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  padding: "40px 32px",
  gap: 0,
};

const formCardStyle = {
  borderRadius: 20,
  minHeight: 520,
  background: "#fff",
  border: `1px solid ${BORDER}`,
};

const formCardBodyStyle = {
  padding: "36px 32px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  height: "100%",
};

const submitBtnStyle = {
  backgroundColor: BRAND,
  borderColor: BRAND,
  borderRadius: 100,
  height: 46,
  fontSize: 15,
  fontWeight: 600,
};

const inputStyle = {
  borderRadius: 10,
  background: "#fff",
  borderColor: BORDER,
  color: TEXT_MAIN,
};

const labelStyle = { color: TEXT_MUTED, fontSize: 13 };

const SPORT_TAGS = ["🎾 Tennis", "🏓 Padel", "⚽ Football", "🏀 Basketball", "🏃 Running"];

const loginRules = {
  email: [
    { required: true, message: "Please enter your email." },
    { type: "email", message: "Please enter a valid email address." },
  ],
  password: [
    { required: true, message: "Please enter your password." },
    { min: 8, message: "Password must be at least 8 characters." },
  ],
};

function injectFonts() {
  if (document.getElementById("sinder-fonts")) return;
  const link = document.createElement("link");
  link.id = "sinder-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap";
  document.head.appendChild(link);
}
injectFonts();

function BrandPanel({ subtitle }) {
  return (
    <Card variant="borderless" style={brandCardStyle} styles={{ body: brandCardBodyStyle }}>
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <span
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: -1,
            color: "white",
          }}
        >
          Sinder
        </span>
      </div>

      <Title level={4} style={{ color: "#fff", margin: "0 0 10px", textAlign: "center" }}>
        {subtitle}
      </Title>
      <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, textAlign: "center", lineHeight: 1.7 }}>
        Connect with players near you based on sport, skill level, and availability.
      </Text>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 32, justifyContent: "center" }}>
        {SPORT_TAGS.map((s) => (
          <span
            key={s}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 100,
              padding: "5px 14px",
              fontSize: 13,
              color: "#fff",
              fontWeight: 500,
            }}
          >
            {s}
          </span>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 24,
          marginTop: 36,
          borderTop: "1px solid rgba(255,255,255,0.15)",
          paddingTop: 24,
          width: "100%",
          justifyContent: "center",
        }}
      >
        {[["10+", "Sports"], ["Bath University", "Location"]].map(([val, lbl]) => (
          <div key={lbl} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'DM Serif Display', serif" }}>{val}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{lbl}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { message } = App.useApp();

  if (user) return <Navigate to="/discover" replace />;

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success("Welcome back!");
      navigate("/discover");
    } catch (err) {
      const msg = err?.response?.data?.error || "Invalid email or password.";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={pageStyle}>
      <Content>
        <Row justify="center" align="middle" style={{ minHeight: "100vh", padding: "24px" }}>
          <Col xs={24} md={20} lg={16} xl={14}>
            <Row gutter={[24, 24]}>
              <Col xs={0} md={12}>
                <BrandPanel subtitle="Find your perfect sports partner" />
              </Col>

              <Col xs={24} md={12}>
                <Card
                  variant="borderless"
                  style={formCardStyle}
                  styles={{ body: formCardBodyStyle }}
                >
                  <Space direction="vertical" size={4} style={{ width: "100%", marginBottom: 28 }}>
                    <Title
                      level={3}
                      style={{
                        margin: 0,
                        color: TEXT_MAIN,
                        fontFamily: "'DM Serif Display', serif",
                        fontWeight: 700,
                        letterSpacing: -0.5,
                        textAlign: "center",
                      }}
                    >
                      Sign in
                    </Title>
                    <Text style={{ color: TEXT_MUTED, fontSize: 13, textAlign: "center", display: "block" }}>
                      Welcome back — let's find your next game
                    </Text>
                  </Space>

                  <Form layout="vertical" onFinish={onFinish} autoComplete="off">
                    <Form.Item label={<span style={labelStyle}>Email</span>} name="email" rules={loginRules.email}>
                      <Input
                        prefix={<UserOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                        placeholder="you@example.com"
                        size="large"
                        style={inputStyle}
                      />
                    </Form.Item>

                    <Form.Item label={<span style={labelStyle}>Password</span>} name="password" rules={loginRules.password}>
                      <Input.Password
                        prefix={<LockOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                        placeholder="Min. 8 characters"
                        size="large"
                        style={inputStyle}
                      />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 12, marginTop: 4 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        icon={<LoginOutlined />}
                        loading={loading}
                        block
                        style={submitBtnStyle}
                      >
                        {loading ? "Signing in..." : "Sign in"}
                      </Button>
                    </Form.Item>
                  </Form>

                  <div style={{ textAlign: "center", marginTop: 8 }}>
                    <Text style={{ color: TEXT_MUTED, fontSize: 13 }}>
                      New to Sinder?{" "}
                      <a href="/register" style={{ color: BRAND, fontWeight: 600 }}>
                        Create an account
                      </a>
                    </Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default function Login() {
  return (
    <App>
      <LoginForm />
    </App>
  );
}
