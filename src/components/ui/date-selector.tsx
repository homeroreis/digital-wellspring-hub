import { Label } from "@/components/ui/label";

interface DateSelectorProps {
  value?: Date;
  onChange: (date: Date | null) => void;
  id?: string;
  label?: string;
  placeholder?: string;
}

const months = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

const DateSelector = ({ value, onChange, id, label, placeholder }: DateSelectorProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1940 + 6 }, (_, i) => currentYear + 5 - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const selectedDay = value?.getDate() || "";
  const selectedMonth = value ? value.getMonth() + 1 : "";
  const selectedYear = value?.getFullYear() || "";

  const handleDateChange = (day: number | string, month: number | string, year: number | string) => {
    if (!day || !month || !year) {
      onChange(null);
      return;
    }
    
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    
    // Verificar se a data é válida
    if (date.getDate() === Number(day) && 
        date.getMonth() === Number(month) - 1 && 
        date.getFullYear() === Number(year)) {
      onChange(date);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">Dia</Label>
          <select
            id={`${id}_day`}
            value={selectedDay}
            onChange={(e) => handleDateChange(e.target.value, selectedMonth, selectedYear)}
            className="w-full py-2 px-3 border border-input bg-background rounded-md text-sm"
          >
            <option value="">Dia</option>
            {days.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
        
        <div>
          <Label className="text-xs text-muted-foreground">Mês</Label>
          <select
            id={`${id}_month`}
            value={selectedMonth}
            onChange={(e) => handleDateChange(selectedDay, e.target.value, selectedYear)}
            className="w-full py-2 px-3 border border-input bg-background rounded-md text-sm"
          >
            <option value="">Mês</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <Label className="text-xs text-muted-foreground">Ano</Label>
          <select
            id={`${id}_year`}
            value={selectedYear}
            onChange={(e) => handleDateChange(selectedDay, selectedMonth, e.target.value)}
            className="w-full py-2 px-3 border border-input bg-background rounded-md text-sm"
          >
            <option value="">Ano</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default DateSelector;