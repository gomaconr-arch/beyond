import { useMemo, useState } from "react";
import { ClipboardList, FilePlus2, Save, Settings2, UserPlus2, Users } from "lucide-react";
import { useAppStore } from "../store/appStore";

const PERSONAL_QUESTIONNAIRE = [
  "Do you easily get tired?",
  "Do you feel sick or get sick often?",
  "Do you suffer from recurring health problems such as headaches, backaches or constipation?",
  "Do you have allergies?",
  "Have you had any medical procedures?",
  "Are you taking maintenance medications?",
  "Do you feel your workplace/homelife stressful?",
  "Do you have sleep problems?",
  "Do you exercise regularly?",
  "Are you into sports?",
  "Has your doctor suggested you lose weight?",
  "Would you like to lose excess inches and pounds?",
  "Would you like to add some pounds to your weight?",
  "Do you smoke?",
  "Do you drink alcohol?",
  "Do you currently have a coach?",
  "Have you tried any Health Programs or Health Check before?",
  "Are you committed to change your habits?",
  "Do you often feel hungry or have constant craving for food?",
];

const onboardingSteps = [
  { key: "basic", title: "Basic client information", icon: UserPlus2 },
  { key: "lifestyle", title: "Personal questionnaire", icon: ClipboardList },
  { key: "evaluation", title: "Body composition", icon: FilePlus2 },
  { key: "save", title: "Save and generate login", icon: Save },
];

const assessmentSteps = [
  { key: "evaluation", title: "Body composition", icon: FilePlus2 },
  { key: "save", title: "Save assessment", icon: Save },
];

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function lbsToKg(lbs) {
  return toNumber(lbs) * 0.45359237;
}

function kgToLbs(kg) {
  return toNumber(kg) * 2.2046226218;
}

function nowLocalDateTime() {
  const now = new Date();
  const pad = (v) => String(v).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function calculateAge(birthdate) {
  if (!birthdate) return 0;
  const date = new Date(birthdate);
  if (Number.isNaN(date.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) age -= 1;
  return Math.max(age, 0);
}

function defaultQuestionnaire() {
  const answers = {};
  PERSONAL_QUESTIONNAIRE.forEach((q) => {
    answers[q] = "no";
  });
  return answers;
}

function Stepper({ steps, activeIndex }) {
  return (
    <div className="card-surface p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const active = index === activeIndex;
          const done = index < activeIndex;
          return (
            <div
              key={step.key}
              className={`rounded-xl border px-3 py-3 text-sm ${
                active
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : done
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon size={16} />
                <span className="font-medium">Step {index + 1}</span>
              </div>
              <p className="mt-1 text-xs">{step.title}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const clients = useAppStore((s) => s.clients);
  const addClientOnboarding = useAppStore((s) => s.addClientOnboarding);
  const addClientAssessment = useAppStore((s) => s.addClientAssessment);
  const updateClientInfo = useAppStore((s) => s.updateClientInfo);
  const removeClient = useAppStore((s) => s.removeClient);
  const exportClientsJson = useAppStore((s) => s.exportClientsJson);

  const [mode, setMode] = useState("onboard");
  const [activeStep, setActiveStep] = useState(0);
  const [unitSystem, setUnitSystem] = useState("lbs");

  const [selectedClientSheet, setSelectedClientSheet] = useState("");
  const [saveResult, setSaveResult] = useState(null);

  const [basic, setBasic] = useState({
    name: "",
    gender: "Male",
    birthdate: "",
    contact_number: "",
    email: "",
    invited_by: "",
    goal1: "",
    goal2: "",
    goal3: "",
    medical_history: "",
    craving_foods: "",
  });

  const [questionnaireAnswers, setQuestionnaireAnswers] = useState(defaultQuestionnaire);

  const [evaluation, setEvaluation] = useState({
    date: nowLocalDateTime(),
    weight_lbs: "",
    weight_kg: "",
    fat_pct: "",
    bone_mass: "",
    water_pct: "",
    muscle_mass: "",
    physique_rating: "",
    rmr: "",
    metabolic_age: "",
    visceral_fat: "",
  });

  const [manageForm, setManageForm] = useState({
    name: "",
    gender: "Male",
    birthdate: "",
    contact_number: "",
    email: "",
    invited_by: "",
    goal1: "",
    goal2: "",
    goal3: "",
    medical_history: "",
  });

  const activeSteps = mode === "onboard" ? onboardingSteps : assessmentSteps;

  const agePreview = useMemo(() => calculateAge(basic.birthdate), [basic.birthdate]);

  const selectedClient = useMemo(
    () => clients.find((c) => c.sheet === selectedClientSheet) || null,
    [clients, selectedClientSheet],
  );

  const fatMass = useMemo(() => {
    const lbs = toNumber(evaluation.weight_lbs);
    const fatPct = toNumber(evaluation.fat_pct);
    const fatLbs = lbs * (fatPct / 100);
    return {
      lbs: fatLbs,
      kg: lbsToKg(fatLbs),
    };
  }, [evaluation.weight_lbs, evaluation.fat_pct]);

  const populateManageForm = (client) => {
    if (!client) return;
    const goals = client.top_health_goals || client.goals || [];
    setManageForm({
      name: client.name || "",
      gender: client.gender || "Male",
      birthdate: client.birthdate || "",
      contact_number: client.contact_number || "",
      email: client.email || "",
      invited_by: client.invited_by || "",
      goal1: goals[0] || "",
      goal2: goals[1] || "",
      goal3: goals[2] || "",
      medical_history: client.medical_history || "",
    });
  };

  const handleClientSelection = (sheet) => {
    setSelectedClientSheet(sheet);
    if (mode !== "manage") return;
    const client = clients.find((c) => c.sheet === sheet);
    populateManageForm(client);
  };

  const weightLabel = unitSystem === "lbs" ? "lbs" : "kgs";

  const displayMass = (lbsValue) => {
    if (lbsValue === "") return "";
    if (unitSystem === "lbs") return lbsValue;
    return lbsToKg(lbsValue).toFixed(1);
  };

  const setMass = (field, value) => {
    if (value === "") {
      setEvaluation((prev) => ({ ...prev, [field]: "" }));
      return;
    }
    if (unitSystem === "lbs") {
      setEvaluation((prev) => ({ ...prev, [field]: value }));
      return;
    }
    const asLbs = kgToLbs(value).toFixed(1);
    setEvaluation((prev) => ({ ...prev, [field]: asLbs }));
  };

  const handlePrimaryWeight = (value) => {
    if (unitSystem === "lbs") {
      const lbs = value;
      const kg = lbs === "" ? "" : lbsToKg(lbs).toFixed(4);
      setEvaluation((prev) => ({ ...prev, weight_lbs: lbs, weight_kg: kg }));
      return;
    }
    const kg = value;
    const lbs = kg === "" ? "" : kgToLbs(kg).toFixed(1);
    setEvaluation((prev) => ({ ...prev, weight_kg: kg, weight_lbs: lbs }));
  };

  const setQuestionAnswer = (question, answer) => {
    setQuestionnaireAnswers((prev) => ({ ...prev, [question]: answer }));
  };

  const downloadClientJson = () => {
    const text = exportClientsJson();
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "client_stats.updated.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetEvaluation = () => {
    setEvaluation({
      date: nowLocalDateTime(),
      weight_lbs: "",
      weight_kg: "",
      fat_pct: "",
      bone_mass: "",
      water_pct: "",
      muscle_mass: "",
      physique_rating: "",
      rmr: "",
      metabolic_age: "",
      visceral_fat: "",
    });
  };

  const resetOnboarding = () => {
    setActiveStep(0);
    setBasic({
      name: "",
      gender: "Male",
      birthdate: "",
      contact_number: "",
      email: "",
      invited_by: "",
      goal1: "",
      goal2: "",
      goal3: "",
      medical_history: "",
      craving_foods: "",
    });
    setQuestionnaireAnswers(defaultQuestionnaire());
    resetEvaluation();
  };

  const submit = () => {
    if (mode === "onboard") {
      const topHealthGoals = [basic.goal1, basic.goal2, basic.goal3].map((g) => g.trim()).filter(Boolean);
      const result = addClientOnboarding({
        basic: {
          name: basic.name,
          gender: basic.gender,
          birthdate: basic.birthdate,
          contact_number: basic.contact_number,
          email: basic.email,
          invited_by: basic.invited_by,
          top_health_goals: topHealthGoals,
          medical_history: basic.medical_history,
        },
        lifestyle: {
          personal_questionnaire: questionnaireAnswers,
          craving_foods: basic.craving_foods,
        },
        evaluation,
      });
      setSaveResult(result);
      if (result.ok) {
        downloadClientJson();
        resetOnboarding();
      }
      return;
    }

    if (mode === "assessment") {
      if (!selectedClientSheet) {
        setSaveResult({ ok: false, message: "Select a client for assessment update." });
        return;
      }
      const result = addClientAssessment({ clientSheet: selectedClientSheet, evaluation });
      setSaveResult(result);
      if (result.ok) {
        downloadClientJson();
        resetEvaluation();
        setSelectedClientSheet("");
      }
      return;
    }

    if (!selectedClientSheet) {
      setSaveResult({ ok: false, message: "Select a client to manage." });
      return;
    }

    const top_health_goals = [manageForm.goal1, manageForm.goal2, manageForm.goal3].map((g) => g.trim()).filter(Boolean);
    const result = updateClientInfo({
      clientSheet: selectedClientSheet,
      updates: {
        name: manageForm.name,
        gender: manageForm.gender,
        birthdate: manageForm.birthdate,
        contact_number: manageForm.contact_number,
        email: manageForm.email,
        invited_by: manageForm.invited_by,
        top_health_goals,
        medical_history: manageForm.medical_history,
      },
    });
    setSaveResult(result);
    if (result.ok) {
      downloadClientJson();
    }
  };

  const handleDelete = () => {
    if (!selectedClientSheet) {
      setSaveResult({ ok: false, message: "Select a client to remove." });
      return;
    }
    if (!window.confirm("Remove selected client and associated login?")) return;

    const result = removeClient(selectedClientSheet);
    setSaveResult(result);
    if (result.ok) {
      downloadClientJson();
      setSelectedClientSheet("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-slate-900">Admin Settings</h1>
        <p className="text-slate-600">
          Configure new onboarding, update existing assessments, and manage client records with JSON export after each change.
        </p>
      </div>

      <section className="card-surface p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("onboard");
              setActiveStep(0);
              setSaveResult(null);
            }}
            className={`rounded-lg border px-3 py-2 text-sm ${
              mode === "onboard" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <span className="inline-flex items-center gap-2"><UserPlus2 size={14} /> New Client Onboarding</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("assessment");
              setActiveStep(0);
              setSaveResult(null);
            }}
            className={`rounded-lg border px-3 py-2 text-sm ${
              mode === "assessment" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <span className="inline-flex items-center gap-2"><ClipboardList size={14} /> Existing Client Assessment Update</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("manage");
              setSaveResult(null);
              if (selectedClientSheet) {
                const client = clients.find((c) => c.sheet === selectedClientSheet);
                populateManageForm(client);
              }
            }}
            className={`rounded-lg border px-3 py-2 text-sm ${
              mode === "manage" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <span className="inline-flex items-center gap-2"><Settings2 size={14} /> Manage Client</span>
          </button>
        </div>
      </section>

      {mode !== "manage" ? <Stepper steps={activeSteps} activeIndex={activeStep} /> : null}

      {(mode === "assessment" || mode === "manage") ? (
        <section className="card-surface p-4">
          <label className="text-sm text-slate-600" htmlFor="existing-client-select">Select Client</label>
          <select
            id="existing-client-select"
            value={selectedClientSheet}
            onChange={(e) => handleClientSelection(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Choose client</option>
            {clients
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((client) => (
                <option key={client.sheet} value={client.sheet}>{client.name}</option>
              ))}
          </select>
          {selectedClient ? (
            <p className="mt-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1"><Users size={12} /> Assessments: {selectedClient.measurements.length}</span>
            </p>
          ) : null}
        </section>
      ) : null}

      {mode === "onboard" && activeStep === 0 ? (
        <section className="card-surface grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-slate-600" htmlFor="client-name">Name</label>
            <input id="client-name" value={basic.name} onChange={(e) => setBasic((p) => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm text-slate-600" htmlFor="client-gender">Gender</label>
            <select id="client-gender" value={basic.gender} onChange={(e) => setBasic((p) => ({ ...p, gender: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-600" htmlFor="client-birthdate">Birthdate</label>
            <input id="client-birthdate" type="date" value={basic.birthdate} onChange={(e) => setBasic((p) => ({ ...p, birthdate: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm text-slate-600" htmlFor="client-age-preview">Age (auto-computed)</label>
            <input id="client-age-preview" value={agePreview || ""} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500" />
          </div>
          <div>
            <label className="text-sm text-slate-600" htmlFor="client-contact">Contact No.</label>
            <input id="client-contact" value={basic.contact_number} onChange={(e) => setBasic((p) => ({ ...p, contact_number: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm text-slate-600" htmlFor="client-email">FB or Email Address</label>
            <input id="client-email" value={basic.email} onChange={(e) => setBasic((p) => ({ ...p, email: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-slate-600" htmlFor="invited-by">Invited By / Contact No.</label>
            <input id="invited-by" value={basic.invited_by} onChange={(e) => setBasic((p) => ({ ...p, invited_by: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="text-sm text-slate-600" htmlFor="goal1">Top Health Goal 1</label>
            <input id="goal1" value={basic.goal1} onChange={(e) => setBasic((p) => ({ ...p, goal1: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm text-slate-600" htmlFor="goal2">Top Health Goal 2</label>
            <input id="goal2" value={basic.goal2} onChange={(e) => setBasic((p) => ({ ...p, goal2: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-slate-600" htmlFor="goal3">Top Health Goal 3</label>
            <input id="goal3" value={basic.goal3} onChange={(e) => setBasic((p) => ({ ...p, goal3: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </div>
        </section>
      ) : null}

      {mode === "onboard" && activeStep === 1 ? (
        <section className="space-y-3">
          <div className="card-surface p-4">
            <h3 className="font-display text-lg text-slate-900">Personal Questionnaire</h3>
            <div className="mt-3 space-y-2">
              {PERSONAL_QUESTIONNAIRE.map((question, idx) => (
                <div key={question} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                  <p className="text-slate-700">{idx + 1}. {question}</p>
                  <div className="mt-2 flex gap-2">
                    {["yes", "no"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setQuestionAnswer(question, option)}
                        className={`rounded-md border px-2 py-1 text-xs uppercase ${
                          questionnaireAnswers[question] === option
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-surface p-4">
            <label className="text-sm text-slate-600" htmlFor="craving-foods">
              If YES, what foods do you usually eat when you have these cravings?
            </label>
            <textarea
              id="craving-foods"
              rows={3}
              value={basic.craving_foods}
              onChange={(e) => setBasic((p) => ({ ...p, craving_foods: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div className="card-surface p-4">
            <label className="text-sm text-slate-600" htmlFor="medical-history">Medical History</label>
            <textarea
              id="medical-history"
              rows={4}
              value={basic.medical_history}
              onChange={(e) => setBasic((p) => ({ ...p, medical_history: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
        </section>
      ) : null}

      {(mode === "assessment" || (mode === "onboard" && activeStep === 2)) ? (
        <section className="card-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-lg text-slate-900">Body Composition</h3>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-xs">
              <button
                type="button"
                onClick={() => setUnitSystem("lbs")}
                className={`rounded-md px-2 py-1 ${unitSystem === "lbs" ? "bg-blue-50 text-blue-700" : "text-slate-600"}`}
              >
                Input in lbs
              </button>
              <button
                type="button"
                onClick={() => setUnitSystem("kg")}
                className={`rounded-md px-2 py-1 ${unitSystem === "kg" ? "bg-blue-50 text-blue-700" : "text-slate-600"}`}
              >
                Input in kgs
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-600" htmlFor="eval-date">Date and Time</label>
              <input id="eval-date" type="datetime-local" value={evaluation.date} onChange={(e) => setEvaluation((p) => ({ ...p, date: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
            </div>
            <div />

            <div>
              <label className="text-sm text-slate-600" htmlFor="weight-primary">Present Weight ({weightLabel})</label>
              <input
                id="weight-primary"
                type="number"
                step={unitSystem === "lbs" ? "0.1" : "0.0001"}
                value={unitSystem === "lbs" ? evaluation.weight_lbs : evaluation.weight_kg}
                onChange={(e) => handlePrimaryWeight(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <p className="text-slate-500">Auto Conversion</p>
              <p className="font-data text-slate-900">{evaluation.weight_lbs || 0} lbs / {evaluation.weight_kg || 0} kgs</p>
            </div>

            <div>
              <label className="text-sm text-slate-600" htmlFor="fat-pct">Fat Percentage (%)</label>
              <input id="fat-pct" type="number" step="0.1" value={evaluation.fat_pct} onChange={(e) => setEvaluation((p) => ({ ...p, fat_pct: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <p className="text-slate-500">Fat Mass (auto)</p>
              <p className="font-data text-slate-900">{fatMass.lbs.toFixed(2)} lbs ({fatMass.kg.toFixed(2)} kgs)</p>
            </div>

            <div>
              <label className="text-sm text-slate-600" htmlFor="bone-mass">Bone Mass ({weightLabel})</label>
              <input id="bone-mass" type="number" step="0.1" value={displayMass(evaluation.bone_mass)} onChange={(e) => setMass("bone_mass", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-slate-600" htmlFor="water-pct">Water Percentage (%)</label>
              <input id="water-pct" type="number" step="0.1" value={evaluation.water_pct} onChange={(e) => setEvaluation((p) => ({ ...p, water_pct: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="text-sm text-slate-600" htmlFor="muscle-mass">Muscle Mass ({weightLabel})</label>
              <input id="muscle-mass" type="number" step="0.1" value={displayMass(evaluation.muscle_mass)} onChange={(e) => setMass("muscle_mass", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-slate-600" htmlFor="physique-rating">Physique Rating</label>
              <input id="physique-rating" type="number" step="0.1" value={evaluation.physique_rating} onChange={(e) => setEvaluation((p) => ({ ...p, physique_rating: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="text-sm text-slate-600" htmlFor="rmr">Resting Metabolic Rate (cal.)</label>
              <input id="rmr" type="number" step="0.1" value={evaluation.rmr} onChange={(e) => setEvaluation((p) => ({ ...p, rmr: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-slate-600" htmlFor="metabolic-age">Metabolic Age</label>
              <input id="metabolic-age" type="number" step="0.1" value={evaluation.metabolic_age} onChange={(e) => setEvaluation((p) => ({ ...p, metabolic_age: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="text-sm text-slate-600" htmlFor="visceral-fat">Visceral Fat</label>
              <input id="visceral-fat" type="number" step="0.1" value={evaluation.visceral_fat} onChange={(e) => setEvaluation((p) => ({ ...p, visceral_fat: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
            </div>
          </div>
        </section>
      ) : null}

      {mode === "manage" ? (
        <section className="card-surface p-4">
          <h3 className="font-display text-lg text-slate-900">Manage Client Information</h3>
          <p className="mt-1 text-sm text-slate-600">Update basic information or remove a client record.</p>

          {selectedClient ? (
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm text-slate-600" htmlFor="manage-name">Name</label>
                <input id="manage-name" value={manageForm.name} onChange={(e) => setManageForm((p) => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm text-slate-600" htmlFor="manage-gender">Gender</label>
                <select id="manage-gender" value={manageForm.gender} onChange={(e) => setManageForm((p) => ({ ...p, gender: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600" htmlFor="manage-birthdate">Birthdate</label>
                <input id="manage-birthdate" type="date" value={manageForm.birthdate} onChange={(e) => setManageForm((p) => ({ ...p, birthdate: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm text-slate-600" htmlFor="manage-age">Age (auto-computed)</label>
                <input id="manage-age" readOnly value={calculateAge(manageForm.birthdate) || ""} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500" />
              </div>
              <div>
                <label className="text-sm text-slate-600" htmlFor="manage-contact">Contact No.</label>
                <input id="manage-contact" value={manageForm.contact_number} onChange={(e) => setManageForm((p) => ({ ...p, contact_number: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm text-slate-600" htmlFor="manage-email">FB or Email Address</label>
                <input id="manage-email" value={manageForm.email} onChange={(e) => setManageForm((p) => ({ ...p, email: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-slate-600" htmlFor="manage-invited">Invited By / Contact No.</label>
                <input id="manage-invited" value={manageForm.invited_by} onChange={(e) => setManageForm((p) => ({ ...p, invited_by: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="text-sm text-slate-600" htmlFor="manage-goal1">Top Health Goal 1</label>
                <input id="manage-goal1" value={manageForm.goal1} onChange={(e) => setManageForm((p) => ({ ...p, goal1: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm text-slate-600" htmlFor="manage-goal2">Top Health Goal 2</label>
                <input id="manage-goal2" value={manageForm.goal2} onChange={(e) => setManageForm((p) => ({ ...p, goal2: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-slate-600" htmlFor="manage-goal3">Top Health Goal 3</label>
                <input id="manage-goal3" value={manageForm.goal3} onChange={(e) => setManageForm((p) => ({ ...p, goal3: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-slate-600" htmlFor="manage-medical-history">Medical History</label>
                <textarea id="manage-medical-history" rows={4} value={manageForm.medical_history} onChange={(e) => setManageForm((p) => ({ ...p, medical_history: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Select a client to edit details or remove account.</p>
          )}
        </section>
      ) : null}

      {((mode === "onboard" && activeStep === 3) || (mode === "assessment" && activeStep === 1) || mode === "manage") ? (
        <section className="card-surface p-4 text-sm text-slate-600">
          <p>Save/export writes updates to app storage and downloads an updated JSON snapshot.</p>
        </section>
      ) : null}

      <section className="card-surface flex flex-wrap items-center justify-between gap-2 p-4">
        {mode !== "manage" ? (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="button"
              disabled={activeStep >= activeSteps.length - 1}
              onClick={() => setActiveStep((s) => Math.min(activeSteps.length - 1, s + 1))}
              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        ) : <div />}

        <div className="flex gap-2">
          <button type="button" onClick={submit} className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {mode === "onboard" ? "Save Onboarding" : mode === "assessment" ? "Save Assessment" : "Update Client"}
          </button>
          {mode === "manage" ? (
            <button type="button" onClick={handleDelete} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Remove Client
            </button>
          ) : null}
        </div>
      </section>

      {saveResult ? (
        <section className={`card-surface p-4 text-sm ${saveResult.ok ? "text-green-400" : "text-red-400"}`}>
          {saveResult.ok ? (
            <>
              <p>Saved successfully.</p>
              {saveResult.credentials ? (
                <p className="mt-1 font-data">
                  Temporary Login: {saveResult.credentials.username} / {saveResult.credentials.password}
                </p>
              ) : null}
            </>
          ) : (
            <p>{saveResult.message || "Unable to save data."}</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
