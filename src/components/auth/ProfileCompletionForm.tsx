import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, CheckCircle, User, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const phoneMask = (val: string) => {
  let v = val.replace(/\D/g, "");
  v = v.replace(/(\d{2})(\d)/, "($1) $2");
  v = v.replace(/(\d{4,5})(\d{4})$/, "$1-$2");
  return v;
};

interface ProfileCompletionFormProps {
  user: any;
  onComplete: () => void;
}

const ProfileCompletionForm = ({ user, onComplete }: ProfileCompletionFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone: "",
    birth_date: undefined as Date | undefined,
    gender: "",
    marital_status: "",
    city: "",
    state: "",
    profession: "",
    education_level: "",
    how_found_us: "",
  });

  const totalSteps = 3;
  const progress = Math.round((currentStep / totalSteps) * 100);

  const handleChange = (field: string, value: any) => {
    const v = field === "phone" ? phoneMask(value) : value;
    setFormData(prev => ({ ...prev, [field]: v }));
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.phone && formData.birth_date && formData.gender;
      case 2:
        return formData.city && formData.state;
      case 3:
        return formData.profession && formData.education_level && formData.how_found_us;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(currentStep) && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isStepValid(3)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
          phone: formData.phone,
          birth_date: formData.birth_date ? format(formData.birth_date, 'yyyy-MM-dd') : null,
          gender: formData.gender,
          marital_status: formData.marital_status,
          city: formData.city,
          state: formData.state,
          profession: formData.profession,
          education_level: formData.education_level,
          how_found_us: formData.how_found_us,
          accept_terms: true,
        });

      if (error) throw error;

      toast({
        title: "Perfil completado!",
        description: "Suas informações foram salvas com sucesso.",
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const StepHeader = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) => (
    <div className="text-center mb-6">
      <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground text-sm">{subtitle}</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-center">Complete seu perfil</CardTitle>
          <p className="text-center text-muted-foreground">
            Apenas mais algumas informações para personalizar sua experiência
          </p>
        </CardHeader>
        <CardContent>
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Etapa {currentStep} de {totalSteps}</span>
              <span className="text-sm text-primary-foreground bg-primary/15 px-2 py-0.5 rounded">{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
              <StepHeader 
                icon={<User className="w-8 h-8" />} 
                title="Informações Pessoais" 
                subtitle="Conte-nos um pouco sobre você" 
              />
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">WhatsApp</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <Label htmlFor="birth_date">Data de nascimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.birth_date && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.birth_date ? format(formData.birth_date, "dd/MM/yyyy") : "Selecione sua data de nascimento"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={formData.birth_date}
                        onSelect={(date) => handleChange("birth_date", date)}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="gender">Gênero</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="w-full py-2 px-3 border border-input bg-background rounded-md"
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="marital_status">Estado civil</Label>
                  <select
                    id="marital_status"
                    value={formData.marital_status}
                    onChange={(e) => handleChange("marital_status", e.target.value)}
                    className="w-full py-2 px-3 border border-input bg-background rounded-md"
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                    <option value="uniao_estavel">União estável</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
              <StepHeader 
                icon={<MapPin className="w-8 h-8" />} 
                title="Localização" 
                subtitle="Onde você mora?" 
              />
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="Sua cidade"
                  />
                </div>

                <div>
                  <Label htmlFor="state">Estado</Label>
                  <select
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className="w-full py-2 px-3 border border-input bg-background rounded-md"
                  >
                    <option value="">Selecione seu estado</option>
                    {[
                      "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
                    ].map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Professional */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
              <StepHeader 
                icon={<Briefcase className="w-8 h-8" />} 
                title="Informações Profissionais" 
                subtitle="Finalizando seu perfil" 
              />
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="profession">Profissão</Label>
                  <Input
                    id="profession"
                    value={formData.profession}
                    onChange={(e) => handleChange("profession", e.target.value)}
                    placeholder="Sua área de atuação"
                  />
                </div>

                <div>
                  <Label htmlFor="education_level">Escolaridade</Label>
                  <select
                    id="education_level"
                    value={formData.education_level}
                    onChange={(e) => handleChange("education_level", e.target.value)}
                    className="w-full py-2 px-3 border border-input bg-background rounded-md"
                  >
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
                  <Label htmlFor="how_found_us">Como nos conheceu?</Label>
                  <select
                    id="how_found_us"
                    value={formData.how_found_us}
                    onChange={(e) => handleChange("how_found_us", e.target.value)}
                    className="w-full py-2 px-3 border border-input bg-background rounded-md"
                  >
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
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              onClick={handlePrev}
              variant="outline"
              disabled={currentStep === 1}
            >
              Anterior
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
              >
                Próximo
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid(currentStep) || loading}
              >
                {loading ? "Salvando..." : "Finalizar"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCompletionForm;