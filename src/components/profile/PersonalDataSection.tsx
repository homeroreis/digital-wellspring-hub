import { useState } from "react";
import { format } from "date-fns";
import { Save, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DateSelector from "@/components/ui/date-selector";

interface PersonalDataSectionProps {
  profile: any;
  user: any;
  onUpdate: (updates: any) => Promise<void>;
}

const phoneMask = (val: string) => {
  let v = val.replace(/\D/g, "");
  v = v.replace(/(\d{2})(\d)/, "($1) $2");
  v = v.replace(/(\d{4,5})(\d{4})$/, "$1-$2");
  return v;
};

const PersonalDataSection = ({ profile, user, onUpdate }: PersonalDataSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    phone: profile.phone || "",
    birth_date: profile.birth_date ? new Date(profile.birth_date) : undefined,
    gender: profile.gender || "",
    marital_status: profile.marital_status || "",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log('Salvando dados do perfil:', formData);
      await onUpdate({
        full_name: formData.full_name,
        phone: formData.phone,
        birth_date: formData.birth_date ? format(formData.birth_date, 'yyyy-MM-dd') : null,
        gender: formData.gender,
        marital_status: formData.marital_status,
      });
      setIsEditing(false);
      console.log('Dados salvos com sucesso');
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      birth_date: profile.birth_date ? new Date(profile.birth_date) : undefined,
      gender: profile.gender || "",
      marital_status: profile.marital_status || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Dados Pessoais</h2>
          <p className="text-muted-foreground">
            Informações básicas sobre você
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
          <Label htmlFor="full_name">Nome completo</Label>
          {isEditing ? (
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Seu nome completo"
            />
          ) : (
            <p className="py-2 px-3 bg-muted rounded-md">
              {profile.full_name || "Não informado"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <p className="py-2 px-3 bg-muted/50 rounded-md text-muted-foreground">
            {user?.email} (não editável)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          {isEditing ? (
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: phoneMask(e.target.value) }))}
              placeholder="(11) 99999-9999"
            />
          ) : (
            <p className="py-2 px-3 bg-muted rounded-md">
              {profile.phone || "Não informado"}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          {isEditing ? (
            <DateSelector
              id="birth_date"
              label="Data de nascimento"
              value={formData.birth_date}
              onChange={(date) => setFormData(prev => ({ ...prev, birth_date: date }))}
            />
          ) : (
            <div className="space-y-2">
              <Label>Data de nascimento</Label>
              <p className="py-2 px-3 bg-muted rounded-md">
                {profile.birth_date ? format(new Date(profile.birth_date), "dd/MM/yyyy") : "Não informado"}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gênero</Label>
          {isEditing ? (
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
              className="w-full py-2 px-3 border border-input bg-background rounded-md"
            >
              <option value="">Selecione</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
            </select>
          ) : (
            <p className="py-2 px-3 bg-muted rounded-md">
              {profile.gender || "Não informado"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="marital_status">Estado civil</Label>
          {isEditing ? (
            <select
              id="marital_status"
              value={formData.marital_status}
              onChange={(e) => setFormData(prev => ({ ...prev, marital_status: e.target.value }))}
              className="w-full py-2 px-3 border border-input bg-background rounded-md"
            >
              <option value="">Selecione</option>
              <option value="solteiro">Solteiro(a)</option>
              <option value="casado">Casado(a)</option>
              <option value="divorciado">Divorciado(a)</option>
              <option value="viuvo">Viúvo(a)</option>
              <option value="uniao_estavel">União estável</option>
            </select>
          ) : (
            <p className="py-2 px-3 bg-muted rounded-md">
              {profile.marital_status || "Não informado"}
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

export default PersonalDataSection;