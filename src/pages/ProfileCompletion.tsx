import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import ProfileCompletionForm from "@/components/auth/ProfileCompletionForm";

const ProfileCompletion = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Check if profile is already complete
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (profile && profile.phone && profile.birth_date) {
        // Profile already complete, redirect to dashboard
        navigate("/dashboard");
        return;
      }

      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const handleCompletion = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verificando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Completar Perfil — Além das Notificações</title>
        <meta name="description" content="Complete suas informações para personalizar sua experiência." />
      </Helmet>
      <Navbar />

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Bem-vindo!</h1>
            <p className="text-muted-foreground">
              Para personalizar sua experiência, precisamos de algumas informações adicionais
            </p>
          </div>

          <ProfileCompletionForm user={user} onComplete={handleCompletion} />
        </div>
      </main>
    </div>
  );
};

export default ProfileCompletion;