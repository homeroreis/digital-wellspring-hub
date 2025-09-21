import { useState } from "react";
import { Save, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfessionalSectionProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
}

const ProfessionalSection = ({ profile, onUpdate }: ProfessionalSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    profession: profile.profession || "",
    education_level: profile.education_level || "",
    income_range: profile.income_range || "",
    how_found_us: profile.how_found_us || "",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log('=== PROFESSIONAL SECTION SAVE ===');
      console.log('Form data atual:', formData);
      console.log('Profile recebido:', profile);
      
      const updateData = {
        profession: formData.profession,
        education_level: formData.education_level,
        income_range: formData.income_range,
        how_found_us: formData.how_found_us,
      };
      
      console.log('Dados que serão enviados via onUpdate:', updateData);
      
      await onUpdate(updateData);
      setIsEditing(false);
      
      console.log('=== PROFESSIONAL SECTION SAVE SUCCESS ===');
    } catch (error) {
      console.error('=== ERRO NO PROFESSIONAL SECTION ===');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      profession: profile.profession || "",
      education_level: profile.education_level || "",
      income_range: profile.income_range || "",
      how_found_us: profile.how_found_us || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Informações Profissionais</h2>
          <p className="text-muted-foreground">
            Dados sobre sua carreira e formação
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit2 className="w-4 h-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="profession">Profissão</Label>
          {isEditing ? (
            <Input
              id="profession"
              value={formData.profession}
              onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
              placeholder="Sua profissão/área"
            />
          ) : (
            <p className="py-2 px-3 bg-muted rounded-md">
              {profile.profession || "Não informado"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="education_level">Escolaridade</Label>
          {isEditing ? (
            <select
              id="education_level"
              value={formData.education_level}
              onChange={(e) => setFormData(prev => ({ ...prev, education_level: e.target.value }))}
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
          ) : (
            <p className="py-2 px-3 bg-muted rounded-md">
              {profile.education_level || "Não informado"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="income_range">Renda familiar</Label>
          {isEditing ? (
            <select
              id="income_range"
              value={formData.income_range}
              onChange={(e) => setFormData(prev => ({ ...prev, income_range: e.target.value }))}
              className="w-full py-2 px-3 border border-input bg-background rounded-md"
            >
              <option value="">Selecione uma faixa</option>
              <option value="ate_2sm">Até 2 salários mínimos</option>
              <option value="2_5sm">2 a 5 salários mínimos</option>
              <option value="5_10sm">5 a 10 salários mínimos</option>
              <option value="10_20sm">10 a 20 salários mínimos</option>
              <option value="acima_20sm">Acima de 20 salários mínimos</option>
              <option value="prefiro_nao_informar">Prefiro não informar</option>
            </select>
          ) : (
            <p className="py-2 px-3 bg-muted rounded-md">
              {profile.income_range || "Não informado"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="how_found_us">Como nos conheceu?</Label>
          {isEditing ? (
            <select
              id="how_found_us"
              value={formData.how_found_us}
              onChange={(e) => setFormData(prev => ({ ...prev, how_found_us: e.target.value }))}
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
          ) : (
            <p className="py-2 px-3 bg-muted rounded-md">
              {profile.how_found_us || "Não informado"}
            </p>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Salvando..." : "Salvar"}
          </Button>
          <Button onClick={handleCancel} variant="outline">
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfessionalSection;