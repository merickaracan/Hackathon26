import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout, Row, Col, Typography, Card, Button, Space, App } from 'antd'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../api/users'

const { Title, Text } = Typography
const { Content } = Layout

const SPORTS = [
  { id: 'tennis',     label: 'Tennis',     emoji: '🎾' },
  { id: 'padel',      label: 'Padel',      emoji: '🏓' },
  { id: 'football',   label: 'Football',   emoji: '⚽' },
  { id: 'basketball', label: 'Basketball', emoji: '🏀' },
  { id: 'running',    label: 'Running',    emoji: '🏃' },
  { id: 'cycling',    label: 'Cycling',    emoji: '🚴' },
  { id: 'swimming',   label: 'Swimming',   emoji: '🏊' },
  { id: 'golf',       label: 'Golf',       emoji: '⛳' },
  { id: 'volleyball', label: 'Volleyball', emoji: '🏐' },
  { id: 'badminton',  label: 'Badminton',  emoji: '🏸' },
]

const SKILLS = [
  { id: 'beginner',     label: 'Beginner',     desc: 'Just starting out, here to learn' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Know the rules, play regularly' },
  { id: 'advanced',     label: 'Advanced',     desc: 'Play to win, training background' },
]

const BRAND      = '#C4856A'
const LIGHT_BG   = '#F5F0E8'
const CARD_BG    = '#fff'
const BORDER     = 'rgba(44,36,32,0.12)'
const TEXT_MAIN  = '#2C2420'
const TEXT_MUTED = 'rgba(44,36,32,0.5)'

const pageStyle = {
  minHeight: '100vh',
  background: LIGHT_BG,
  fontFamily: "'DM Sans', sans-serif",
}

function StepDots({ step }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
      {[1, 2].map(i => (
        <div
          key={i}
          style={{
            height: 4,
            borderRadius: 99,
            transition: 'all 0.3s',
            width: i === step ? 32 : 8,
            background: i === step ? BRAND : i < step ? 'rgba(22,163,74,0.4)' : 'rgba(255,255,255,0.12)',
          }}
        />
      ))}
    </div>
  )
}

function LeftPanel({ step }) {
  const steps = [
    { num: '01', heading: 'Pick your\nsports', sub: 'Select every sport you play — you can always add more later.' },
    { num: '02', heading: "Rate each\nsport",  sub: 'Set your level for each sport individually — so you get matched accurately.' },
  ]
  const current = steps[step - 1]

  return (
    <Card
      variant="borderless"
      style={{
        height: '100%',
        minHeight: 480,
        background: `linear-gradient(145deg, ${BRAND} 0%, #2C2420 100%)`,
        border: 'none',
        borderRadius: 20,
      }}
      styles={{
        body: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '100%',
          padding: '40px 36px',
        },
      }}
    >
      <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        step {current.num} of 02
      </Text>
      <Title
        level={2}
        style={{
          color: '#fff',
          fontFamily: "'DM Serif Display', serif",
          fontWeight: 800,
          fontSize: 38,
          lineHeight: 1.15,
          letterSpacing: -1,
          margin: '12px 0 16px',
          whiteSpace: 'pre-line',
        }}
      >
        {current.heading}
      </Title>
      <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7 }}>
        {current.sub}
      </Text>

      <div style={{ marginTop: 'auto', paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
          University of Bath
        </Text>
      </div>
    </Card>
  )
}

function OnboardingInner() {
  const { setProfile } = useAuth()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [step, setStep] = useState(1)
  const [selectedSports, setSelectedSports] = useState([])
  const [skillLevels, setSkillLevels] = useState({})
  const [loading, setLoading] = useState(false)

  function toggleSport(id) {
    setSelectedSports(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const allRated = selectedSports.length > 0 && selectedSports.every(id => skillLevels[id])

  async function handleFinish() {
    setLoading(true)
    try {
      const sports = selectedSports.map(s => ({ sport: s, skill: skillLevels[s] }))
      const updated = await updateProfile({ sports, university: 'University of Bath' })
      setProfile(updated)
      navigate('/discover')
    } catch (err) {
      message.error(err.message || 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <Layout style={pageStyle}>
      <Content>
        <Row justify="center" align="middle" style={{ minHeight: '100vh', padding: '24px' }}>
          <Col xs={24} md={20} lg={16} xl={14}>
            <Row gutter={[24, 24]}>

              {/* Left panel */}
              <Col xs={0} md={12}>
                <LeftPanel step={step} />
              </Col>

              {/* Right card */}
              <Col xs={24} md={12}>
                <Card
                  variant="borderless"
                  style={{ borderRadius: 20, background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 2px 16px rgba(44,36,32,0.07)' }}
                  styles={{ body: { padding: '36px 36px', display: 'flex', flexDirection: 'column', minHeight: 480 } }}
                >
                  <StepDots step={step} />

                  {/* Step 1 — Sports */}
                  {step === 1 && (
                    <>
                      <Space direction="vertical" size={4} style={{ marginBottom: 20 }}>
                        <Title level={4} style={{ margin: 0, color: TEXT_MAIN, fontFamily: "'DM Serif Display', serif", fontWeight: 700 }}>
                          What do you play?
                        </Title>
                        <Text style={{ color: TEXT_MUTED, fontSize: 13 }}>Pick all that apply</Text>
                      </Space>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: 1 }}>
                        {SPORTS.map(sport => {
                          const selected = selectedSports.includes(sport.id)
                          return (
                            <button
                              key={sport.id}
                              onClick={() => toggleSport(sport.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '12px 14px',
                                borderRadius: 12,
                                border: selected ? `1px solid rgba(196,133,106,0.6)` : `1px solid ${BORDER}`,
                                background: selected ? 'rgba(196,133,106,0.1)' : '#F5F0E8',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.15s',
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              <span style={{ fontSize: 18 }}>{sport.emoji}</span>
                              <span style={{ fontSize: 13, fontWeight: 500, color: TEXT_MAIN }}>{sport.label}</span>
                            </button>
                          )
                        })}
                      </div>

                      <Button
                        type="primary"
                        size="large"
                        block
                        disabled={selectedSports.length === 0}
                        onClick={() => setStep(2)}
                        style={{ marginTop: 20, borderRadius: 100, height: 46, fontWeight: 600, backgroundColor: BRAND, borderColor: BRAND }}
                      >
                        Continue →
                      </Button>
                    </>
                  )}

                  {/* Step 2 — Skill level per sport */}
                  {step === 2 && (
                    <>
                      <Space direction="vertical" size={4} style={{ marginBottom: 20 }}>
                        <Title level={4} style={{ margin: 0, color: TEXT_MAIN, fontFamily: "'DM Serif Display', serif", fontWeight: 700 }}>
                          What's your level?
                        </Title>
                        <Text style={{ color: TEXT_MUTED, fontSize: 13 }}>Rate yourself for each sport</Text>
                      </Space>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflowY: 'auto' }}>
                        {selectedSports.map(sportId => {
                          const sport = SPORTS.find(s => s.id === sportId)
                          return (
                            <div key={sportId}>
                              <Text style={{ color: TEXT_MAIN, fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                                {sport.emoji} {sport.label}
                              </Text>
                              <div style={{ display: 'flex', gap: 8 }}>
                                {SKILLS.map(skill => {
                                  const selected = skillLevels[sportId] === skill.id
                                  return (
                                    <button
                                      key={skill.id}
                                      onClick={() => setSkillLevels(prev => ({ ...prev, [sportId]: skill.id }))}
                                      style={{
                                        flex: 1,
                                        padding: '10px 8px',
                                        borderRadius: 10,
                                        border: selected ? '1px solid rgba(196,133,106,0.6)' : `1px solid ${BORDER}`,
                                        background: selected ? 'rgba(196,133,106,0.12)' : '#F5F0E8',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        fontFamily: "'DM Sans', sans-serif",
                                        color: selected ? BRAND : TEXT_MUTED,
                                        fontSize: 12,
                                        fontWeight: selected ? 600 : 400,
                                      }}
                                    >
                                      {skill.label}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                        <Button
                          size="large"
                          onClick={() => setStep(1)}
                          style={{ borderRadius: 100, height: 46, background: 'transparent', borderColor: BORDER, color: TEXT_MUTED }}
                        >
                          Back
                        </Button>
                        <Button
                          type="primary"
                          size="large"
                          block
                          loading={loading}
                          disabled={!allRated}
                          onClick={handleFinish}
                          style={{ borderRadius: 100, height: 46, fontWeight: 600, backgroundColor: BRAND, borderColor: BRAND }}
                        >
                          {loading ? 'Setting up...' : "Let's go →"}
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              </Col>

            </Row>
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}

export default function Onboarding() {
  return (
    <App>
      <OnboardingInner />
    </App>
  )
}
