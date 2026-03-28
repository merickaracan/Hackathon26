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
  Select,
  App,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;
const { Content } = Layout;

const BRAND = "#16A34A";
const DARK_BG = "#0B1A10";
const CARD_BG = "#122A1A";
const BORDER = "rgba(255,255,255,0.08)";

const SPORTS = [
  { label: "🎾 Tennis",    value: "tennis"    },
  { label: "🏓 Padel",     value: "padel"     },
  { label: "⚽ Football",   value: "football"   },
  { label: "🏀 Basketball", value: "basketball" },
  { label: "🏃 Running",   value: "running"   },
  { label: "🚴 Cycling",   value: "cycling"   },
  { label: "🏊 Swimming",  value: "swimming"  },
  { label: "⛳ Golf",      value: "golf"      },
];

const SKILLS = [
  { label: "Beginner",     value: "beginner"     },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced",     value: "advanced"     },
];

const SPORT_TAGS = ["🎾 Tennis", "🏓 Padel", "⚽ Football", "🏀 Basketball", "🏃 Running"];

const rules = {
  name: [
    { required: true, message: "Please enter your name." },
    { min: 2, message: "Name must be at least 2 characters." },
  ],
  email: [
    { required: true, message: "Please enter your email." },
    { type: "email", message: "Please enter a valid email address." },
  ],
  password: [
    { required: true, message: "Please enter a password." },
    { min: 8, message: "Password must be at least 8 characters." },
  ],
  confirmPassword: [
    { required: true, message: "Please confirm your password." },
  ],
  sport: [{ required: true, message: "Please select your primary sport." }],
  skill_level: [{ required: true, message: "Please select your skill level." }],
};

const pageStyle = {
  minHeight: "100vh",
  background: `radial-gradient(ellipse 80% 60% at 50% 100%, rgba(22,163,74,0.18) 0%, transparent 70%), ${DARK_BG}`,
  fontFamily: "'DM Sans', sans-serif",
};

const inputStyle = {
  borderRadius: 10,
  background: "rgba(255,255,255,0.05)",
  borderColor: BORDER,
  color: "#fff",
};

const labelStyle = {
  color: "rgba(255,255,255,0.7)",
  fontSize: 13,
};

const submitBtnStyle = {
  backgroundColor: BRAND,
  borderColor: BRAND,
  borderRadius: 100,
  height: 46,
  fontSize: 15,
  fontWeight: 600,
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

function BrandPanel() {
  return (
    <Card
      variant="borderless"
      style={{
        height: "100%",
        minHeight: 560,
        background: `linear-gradient(145deg, ${BRAND} 0%, #0F5C2E 100%)`,
        border: "none",
        borderRadius: 20,
      }}
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: "40px 32px",
        },
      }}
    >
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: -2,
            color: "white",
          }}
        >
          Sin
          <span style={{ color: "rgba(255,255,255,0.55)" }}>der</span>
        </span>
      </div>

      <Title
        level={4}
        style={{ color: "#fff", margin: "0 0 10px", textAlign: "center" }}
      >
        Join hundreds of players near you
      </Title>
      <Text
        style={{
          color: "rgba(255,255,255,0.65)",
          fontSize: 14,
          textAlign: "center",
          lineHeight: 1.7,
        }}
      >
        Connect with players near you based on sport, skill level, and
        availability. No more one-sided games.
      </Text>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 32,
          justifyContent: "center",
        }}
      >
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
          marginTop: 36,
          borderTop: "1px solid rgba(255,255,255,0.15)",
          paddingTop: 24,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {[
          ["01", "Create your profile with your sport & skill"],
          ["02", "Browse players and open game posts near you"],
          ["03", "Send a request and get matched instantly"],
        ].map(([num, text]) => (
          <div key={num} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 18,
                fontWeight: 800,
                color: "rgba(255,255,255,0.3)",
                minWidth: 28,
              }}
            >
              {num}
            </span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
              {text}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const { message } = App.useApp();

  if (user) return <Navigate to="/discover" replace />;

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register(
        values.name,
        values.email,
        values.password,
        values.sport,
        values.skill_level
      );
      message.success("Account created — welcome to Sinder!");
      navigate("/discover");
    } catch (err) {
      const serverError = err?.response?.data?.error;
      const msg = serverError || "Registration failed. Please try again.";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={pageStyle}>
      <Content>
        <Row
          justify="center"
          align="middle"
          style={{ minHeight: "100vh", padding: "24px" }}
        >
          <Col xs={24} md={20} lg={16} xl={14}>
            <Row gutter={[24, 24]}>
              <Col xs={0} md={12}>
                <BrandPanel />
              </Col>

              <Col xs={24} md={12}>
                <Card
                  variant="borderless"
                  style={{
                    borderRadius: 20,
                    background: CARD_BG,
                    border: `1px solid ${BORDER}`,
                  }}
                  styles={{
                    body: {
                      padding: "32px 32px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    },
                  }}
                >
                  <Space
                    direction="vertical"
                    size={4}
                    style={{ width: "100%", marginBottom: 24 }}
                  >
                    <Title
                      level={3}
                      style={{
                        margin: 0,
                        color: "#fff",
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 800,
                        letterSpacing: -0.5,
                        textAlign: "center",
                      }}
                    >
                      Create account
                    </Title>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.45)",
                        fontSize: 13,
                        textAlign: "center",
                        display: "block",
                      }}
                    >
                      Tell us about yourself and your sport
                    </Text>
                  </Space>

                  <Form
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                  >
                    <Form.Item
                      label={<span style={labelStyle}>Full name</span>}
                      name="name"
                      rules={rules.name}
                    >
                      <Input
                        prefix={<UserOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                        placeholder="Jamie Davies"
                        size="large"
                        style={inputStyle}
                      />
                    </Form.Item>

                    <Form.Item
                      label={<span style={labelStyle}>Email</span>}
                      name="email"
                      rules={rules.email}
                    >
                      <Input
                        prefix={<MailOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                        placeholder="you@example.com"
                        size="large"
                        style={inputStyle}
                      />
                    </Form.Item>

                    <Form.Item
                      label={<span style={labelStyle}>Password</span>}
                      name="password"
                      rules={rules.password}
                      hasFeedback
                    >
                      <Input.Password
                        prefix={<LockOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                        placeholder="Min. 8 characters"
                        size="large"
                        style={inputStyle}
                        visibilityToggle={{
                          visible: passwordVisible,
                          onVisibleChange: setPasswordVisible,
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      label={<span style={labelStyle}>Confirm password</span>}
                      name="confirmPassword"
                      dependencies={["password"]}
                      hasFeedback
                      rules={rules.confirmPassword}
                    >
                      <Input.Password
                        prefix={<CheckCircleOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                        placeholder="Repeat your password"
                        size="large"
                        style={inputStyle}
                        visibilityToggle={{
                          visible: passwordVisible,
                          onVisibleChange: setPasswordVisible,
                        }}
                      />
                    </Form.Item>

                    <Row gutter={12}>
                      <Col span={14}>
                        <Form.Item
                          label={<span style={labelStyle}>Primary sport</span>}
                          name="sport"
                          rules={rules.sport}
                        >
                          <Select
                            placeholder="Pick a sport"
                            size="large"
                            options={SPORTS}
                            style={{ borderRadius: 10 }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={10}>
                        <Form.Item
                          label={<span style={labelStyle}>Skill level</span>}
                          name="skill_level"
                          rules={rules.skill_level}
                        >
                          <Select
                            placeholder="Level"
                            size="large"
                            options={SKILLS}
                            style={{ borderRadius: 10 }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item style={{ marginBottom: 12, marginTop: 4 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        icon={<CheckCircleOutlined />}
                        loading={loading}
                        block
                        style={submitBtnStyle}
                      >
                        {loading ? "Creating account..." : "Create account"}
                      </Button>
                    </Form.Item>
                  </Form>

                  <div style={{ textAlign: "center", marginTop: 8 }}>
                    <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                      Already have an account?{" "}
                      <a href="/login" style={{ color: BRAND, fontWeight: 600 }}>
                        Sign in
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

export default function Register() {
  return (
    <App>
      <RegisterForm />
    </App>
  );
}
