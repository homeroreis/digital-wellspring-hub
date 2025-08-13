import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, Eye, EyeOff, Heart, MapPin, Briefcase, Sparkles, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Multi-step signup form adapted to the project's design system tokens
// Uses semantic colors and minimal custom logic; stores rich metadata in auth.user_metadata

const phoneMask = (val: string) => {
  let v = val.replace(/\D/g, "");
  v = v.replace(/(\d{2})(\d)/, "($1) $2");
  v = v.replace(/(\d{4,5})(\d{4})$/, "$1-$2");
  return v;
};

const totalSteps = 5;

const InteractiveSignupForm: React.FC = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Passo 1
    name: "",
    email: "",
    phone: "",

    // Passo 2
    age: "",
    gender: "",
    maritalStatus: "",

    // Passo 3
    city: "",
    state: "",

    // Passo 4
    profession: "",
    educationLevel: "",
    incomeRange: "",

    // Passo 5
    howFoundUs: "",
    acceptTerms: false as boolean,
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const progress = useMemo(() => Math.round((currentStep / totalSteps) * 100), [currentStep]);

  const getStepFields = (step: number) => {
    switch (step) {
      case 1: return ["name", "email", "phone"];
      case 2: return ["age", "gender"];
      case 3: return ["city", "state"];
      case 4: return ["profession", "educationLevel"];
      case 5: return ["howFoundUs", "acceptTerms", "password"];
      default: return [];
    }
  };

  const validateField = (field: string, value: any) => {
    const next = { ...errors };
    switch (field) {
      case "name":
        if (!value || value.length < 2) next.name = "Nome deve ter pelo menos 2 caracteres"; else delete next.name;
        break;
      case "email":
        if (!value) next.email = "Email é obrigatório";
        else if (!/^\S+@\S+\.\S+$/.test(value)) next.email = "Email inválido"; else delete next.email;
        break;
      case "phone":
        if (!value) next.phone = "Telefone é obrigatório"; else if (value.replace(/\D/g, "").length < 10) next.phone = "Informe um telefone válido"; else delete next.phone;
        break;
      case "age":
        if (!value) next.age = "Idade é obrigatória"; else if (+value < 13 || +value > 100) next.age = "Idade deve ser entre 13 e 100"; else delete next.age;
        break;
      case "gender":
        if (!value) next.gender = "Selecione o gênero"; else delete next.gender;
        break;
      case "city":
        if (!value) next.city = "Cidade é obrigatória"; else delete next.city;
        break;
      case "state":
        if (!value) next.state = "Estado é obrigatório"; else delete next.state;
        break;
      case "profession":
        if (!value) next.profession = "Profissão é obrigatória"; else delete next.profession;
        break;
      case "educationLevel":
        if (!value) next.educationLevel = "Escolaridade é obrigatória"; else delete next.educationLevel;
        break;
      case "howFoundUs":
        if (!value) next.howFoundUs = "Selecione uma opção"; else delete next.howFoundUs;
        break;
      case "acceptTerms":
        if (!value) next.acceptTerms = "Você precisa aceitar os termos"; else delete next.acceptTerms;
        break;
      case "password":
        if (!value) next.password = "Senha é obrigatória"; else if (String(value).length < 6) next.password = "Mínimo de 6 caracteres"; else delete next.password;
        break;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const isStepValid = (step: number) => {
    const fields = getStepFields(step);
    return fields.every((f) => {
      if (f === "acceptTerms") return !!formData[f as keyof typeof formData];
      return !!formData[f as keyof typeof formData] && !errors[f];
    });
  };

  const handleChange = (field: string, value: any) => {
    const v = field === "phone" ? phoneMask(value) : value;
    setFormData((p) => ({ ...p, [field]: v }));
    validateField(field, v);
  };

  const onNext = () => {
    const fields = getStepFields(currentStep);
    let ok = true;
    fields.forEach((f) => { if (!validateField(f, (formData as any)[f])) ok = false; });
    if (ok && currentStep < totalSteps) setCurrentStep((s) => s + 1);
  };

  const onPrev = () => setCurrentStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    const lastStepOk = isStepValid(5);
    if (!lastStepOk) return;
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.name,
            phone: formData.phone,
            age: formData.age,
            gender: formData.gender,
            marital_status: formData.maritalStatus,
            city: formData.city,
            state: formData.state,
            profession: formData.profession,
            education_level: formData.educationLevel,
            income_range: formData.incomeRange,
            how_found_us: formData.howFoundUs,
            accept_terms: formData.acceptTerms,
          },
        },
      });
      if (error) throw error;
      toast({ title: "Confirme seu e-mail", description: "Enviamos um link de confirmação para o seu e-mail." });
    } catch (err: any) {
      toast({ title: "Não foi possível concluir", description: err?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const StepHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
    <div className="text-center mb-6">
      <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground text-sm">{subtitle}</p>
    </div>
  );

  return (
    <div className="min-h-[540px]">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Etapa {currentStep} de {totalSteps}</span>
          <span className="text-sm text-primary-foreground bg-primary/15 px-2 py-0.5 rounded">{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-3">
          {[1,2,3,4,5].map((s) => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-smooth ${
              s < currentStep ? "bg-accent text-accent-foreground" : s === currentStep ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>{s < currentStep ? <CheckCircle className="w-4 h-4" /> : s}</div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="rounded-xl border bg-card p-6 shadow-soft">
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
            <StepHeader icon={<User className="w-8 h-8" />} title="Vamos nos conhecer" subtitle="Conte-nos um pouco sobre você" />
            <div>
              <label className="block text-sm mb-1">Nome completo</label>
              <input className={`w-full px-4 py-3 rounded-lg border bg-background`} placeholder="Como você gostaria de ser chamado?" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1">E-mail</label>
              <input type="email" className={`w-full px-4 py-3 rounded-lg border bg-background`} placeholder="seu@email.com" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1">WhatsApp</label>
              <input type="tel" className={`w-full px-4 py-3 rounded-lg border bg-background`} placeholder="(11) 99999-9999" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
            <StepHeader icon={<Heart className="w-8 h-8" />} title="Perfil pessoal" subtitle="Isso nos ajuda a personalizar sua experiência" />
            <div>
              <label className="block text-sm mb-1">Idade</label>
              <input type="number" className={`w-full px-4 py-3 rounded-lg border bg-background`} placeholder="Quantos anos você tem?" value={formData.age} onChange={(e) => handleChange("age", e.target.value)} />
              {errors.age && <p className="text-xs text-destructive mt-1">{errors.age}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1">Gênero</label>
              <select className={`w-full px-4 py-3 rounded-lg border bg-background`} value={formData.gender} onChange={(e) => handleChange("gender", e.target.value)}>
                <option value="">Selecione uma opção</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
                <option value="prefiro_nao_informar">Prefiro não informar</option>
              </select>
              {errors.gender && <p className="text-xs text-destructive mt-1">{errors.gender}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1">Estado civil</label>
              <select className={`w-full px-4 py-3 rounded-lg border bg-background`} value={formData.maritalStatus} onChange={(e) => handleChange("maritalStatus", e.target.value)}>
                <option value="">Selecione uma opção</option>
                <option value="solteiro">Solteiro(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="viuvo">Viúvo(a)</option>
                <option value="uniao_estavel">União estável</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
            <StepHeader icon={<MapPin className="w-8 h-8" />} title="Onde você está?" subtitle="Vamos mapear nossa comunidade" />
            <div>
              <label className="block text-sm mb-1">Cidade</label>
              <input className={`w-full px-4 py-3 rounded-lg border bg-background`} placeholder="Em qual cidade você mora?" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Estado</label>
              <select className={`w-full px-4 py-3 rounded-lg border bg-background`} value={formData.state} onChange={(e) => handleChange("state", e.target.value)}>
                <option value="">Selecione seu estado</option>
                {[
                  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
                ].map((uf) => (<option key={uf} value={uf}>{uf}</option>))}
              </select>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
            <StepHeader icon={<Briefcase className="w-8 h-8" />} title="Vida profissional" subtitle="Entenda melhor seu contexto" />
            <div>
              <label className="block text-sm mb-1">Profissão</label>
              <input className={`w-full px-4 py-3 rounded-lg border bg-background`} placeholder="Qual sua área de atuação?" value={formData.profession} onChange={(e) => handleChange("profession", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Escolaridade</label>
              <select className={`w-full px-4 py-3 rounded-lg border bg-background`} value={formData.educationLevel} onChange={(e) => handleChange("educationLevel", e.target.value)}>
                <option value="">Selecione seu nível</option>
                <option value="fundamental">Ensino Fundamental</option>
                <option value="medio">Ensino Médio</option>
                <option value="superior">Ensino Superior</option>
                <option value="pos_graduacao">Pós-graduação</option>
                <option value="mestrado">Mestrado</option>
                <option value="doutorado">Doutorado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Renda familiar</label>
              <select className={`w-full px-4 py-3 rounded-lg border bg-background`} value={formData.incomeRange} onChange={(e) => handleChange("incomeRange", e.target.value)}>
                <option value="">Selecione uma faixa</option>
                <option value="ate_2sm">Até 2 salários mínimos</option>
                <option value="2_5sm">2 a 5 salários mínimos</option>
                <option value="5_10sm">5 a 10 salários mínimos</option>
                <option value="10_20sm">10 a 20 salários mínimos</option>
                <option value="acima_20sm">Acima de 20 salários mínimos</option>
                <option value="prefiro_nao_informar">Prefiro não informar</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
            <StepHeader icon={<Sparkles className="w-8 h-8" />} title="Quase lá!" subtitle="Últimas informações para começarmos" />
            <div>
              <label className="block text-sm mb-1">Como nos conheceu?</label>
              <select className={`w-full px-4 py-3 rounded-lg border bg-background`} value={formData.howFoundUs} onChange={(e) => handleChange("howFoundUs", e.target.value)}>
                <option value="">Selecione uma opção</option>
                <option value="google">Pesquisa no Google</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="amigo">Indicação de amigo</option>
                <option value="igreja">Igreja/Comunidade</option>
                <option value="outro">Outro</option>
              </select>
              {errors.howFoundUs && <p className="text-xs text-destructive mt-1">{errors.howFoundUs}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1">Senha</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} className={`w-full px-4 py-3 rounded-lg border bg-background pr-10`} placeholder="Crie uma senha" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} />
                <button type="button" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-smooth" onClick={() => setShowPassword((s) => !s)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>
            <label className="flex items-start gap-3 rounded-lg bg-secondary p-4">
              <input type="checkbox" checked={formData.acceptTerms} onChange={(e) => handleChange("acceptTerms", e.target.checked)} className="mt-1" />
              <span className="text-sm text-muted-foreground">Aceito os termos de uso e política de privacidade e autorizo o envio de conteúdos educacionais.</span>
            </label>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={onPrev} disabled={currentStep === 1} className={`flex items-center px-4 py-2 rounded-lg font-medium transition-smooth ${currentStep === 1 ? "bg-secondary text-muted-foreground cursor-not-allowed" : "bg-secondary hover:bg-muted"}`}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
          </button>
          {currentStep < totalSteps ? (
            <button onClick={onNext} disabled={!isStepValid(currentStep)} className={`flex items-center px-5 py-2 rounded-lg font-medium transition-smooth ${isStepValid(currentStep) ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-secondary text-muted-foreground cursor-not-allowed"}`}>
              Próximo <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!isStepValid(5) || loading} className={`flex items-center px-5 py-2 rounded-lg font-medium transition-smooth ${isStepValid(5) && !loading ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-secondary text-muted-foreground cursor-not-allowed"}`}>
              {loading ? "Enviando..." : "Começar minha jornada!"} <Sparkles className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-3">Seus dados estão seguros conosco.</p>
    </div>
  );
};

export default InteractiveSignupForm;
