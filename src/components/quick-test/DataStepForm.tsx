import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface PersonalData {
  fullName: string;
  whatsapp: string;
  age: string;
  city: string;
  acceptContact: boolean;
}

interface DataStepFormProps {
  personalData: PersonalData;
  onInputChange: (field: keyof PersonalData, value: string | boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const DataStepForm: React.FC<DataStepFormProps> = ({
  personalData,
  onInputChange,
  onBack,
  onSubmit,
  isSubmitting
}) => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">Seus Dados</CardTitle>
          <p className="text-muted-foreground">
            Para gerar seu resultado e permitir o acompanhamento
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo *</Label>
            <Input
              id="fullName"
              type="text"
              value={personalData.fullName}
              onChange={(e) => onInputChange('fullName', e.target.value)}
              placeholder="Digite seu nome completo"
              className="w-full"
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <Input
              id="whatsapp"
              type="tel"
              value={personalData.whatsapp}
              onChange={(e) => onInputChange('whatsapp', e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full"
              autoComplete="tel"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={personalData.age}
                onChange={(e) => onInputChange('age', e.target.value)}
                placeholder="Sua idade"
                autoComplete="age"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                type="text"
                value={personalData.city}
                onChange={(e) => onInputChange('city', e.target.value)}
                placeholder="Sua cidade"
                autoComplete="address-level2"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="acceptContact"
              checked={personalData.acceptContact}
              onCheckedChange={(checked) => onInputChange('acceptContact', checked as boolean)}
            />
            <Label htmlFor="acceptContact" className="text-sm">
              Aceito receber contato posterior sobre o programa completo
            </Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Voltar
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Processando..." : "Ver Resultado"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(DataStepForm);