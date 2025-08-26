import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { User, MapPin, Briefcase, Settings, Bell, Shield, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PersonalDataSection from "@/components/profile/PersonalDataSection";
import LocationSection from "@/components/profile/LocationSection";
import ProfessionalSection from "@/components/profile/ProfessionalSection";
import AccountSettingsSection from "@/components/profile/AccountSettingsSection";

type ProfileData = {
  full_name?: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  marital_status?: string;
  city?: string;
  state?: string;
  profession?: string;
  education_level?: string;
  income_range?: string;
  how_found_us?: string;
  accept_terms?: boolean;
};

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileData>({});
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth", { state: { redirectTo: "/profile" } });
        return;
      }
      setUser(session.user);
      await fetchProfile(session.user.id);
    };

    checkAuth();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setProfile(data || {});
    } catch (error: any) {
      toast({
        title: "Erro ao carregar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          ...updates,
        });

      if (error) throw error;

      setProfile(prev => ({ ...prev, ...updates }));
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getCompletionPercentage = () => {
    const fields = [
      profile.full_name,
      profile.phone,
      profile.birth_date,
      profile.gender,
      profile.marital_status,
      profile.city,
      profile.state,
      profile.profession,
      profile.education_level,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const sections = [
    { id: "personal", label: "Dados Pessoais", icon: User },
    { id: "location", label: "Localização", icon: MapPin },
    { id: "professional", label: "Profissional", icon: Briefcase },
    { id: "account", label: "Conta", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Meu Perfil — Além das Notificações</title>
        <meta name="description" content="Gerencie suas informações pessoais e configurações de conta." />
      </Helmet>
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e configurações de conta
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3">
                    <User className="w-10 h-10" />
                  </div>
                  <CardTitle className="text-lg">
                    {profile.full_name || user?.email?.split("@")[0] || "Usuário"}
                  </CardTitle>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="secondary">
                      {getCompletionPercentage()}% completo
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors ${
                            activeSection === section.id
                              ? "bg-accent text-accent-foreground border-r-2 border-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="flex-1">{section.label}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-6">
                  {activeSection === "personal" && (
                    <PersonalDataSection
                      profile={profile}
                      user={user}
                      onUpdate={updateProfile}
                    />
                  )}
                  {activeSection === "location" && (
                    <LocationSection
                      profile={profile}
                      onUpdate={updateProfile}
                    />
                  )}
                  {activeSection === "professional" && (
                    <ProfessionalSection
                      profile={profile}
                      onUpdate={updateProfile}
                    />
                  )}
                  {activeSection === "account" && (
                    <AccountSettingsSection user={user} />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;