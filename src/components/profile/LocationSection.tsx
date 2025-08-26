import { useState } from "react";
import { Save, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationSectionProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
}

const LocationSection = ({ profile, onUpdate }: LocationSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    city: profile.city || "",
    state: profile.state || "",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate({
        city: formData.city,
        state: formData.state,
      });
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      city: profile.city || "",
      state: profile.state || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Localização</h2>
          <p className="text-muted-foreground">
            Onde você mora atualmente
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
          <Label htmlFor="city">Cidade</Label>
          {isEditing ? (
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Sua cidade"
            />
          ) : (
            <p className="py-2 px-3 bg-muted rounded-md">
              {profile.city || "Não informado"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          {isEditing ? (
            <select
              id="state"
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              className="w-full py-2 px-3 border border-input bg-background rounded-md"
            >
              <option value="">Selecione seu estado</option>
              {[
                "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
              ].map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          ) : (
            <p className="py-2 px-3 bg-muted rounded-md">
              {profile.state || "Não informado"}
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

export default LocationSection;