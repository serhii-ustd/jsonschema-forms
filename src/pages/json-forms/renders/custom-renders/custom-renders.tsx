import { withJsonFormsControlProps } from "@jsonforms/react";
import {
  rankWith,
  isStringControl,
  isIntegerControl,
  isBooleanControl,
  isEnumControl,
  isDateControl,
  and,
  not,
  type ControlProps,
} from "@jsonforms/core";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

const CustomTextControl = ({
  data,
  handleChange,
  path,
  label,
  errors,
  required,
}: ControlProps) => (
  <div className="space-y-2">
    <Label htmlFor={path} className={cn(errors && "text-destructive")}>
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
    <Input
      id={path}
      value={data || ""}
      onChange={(e) => handleChange(path, e.target.value)}
      className={cn(
        "transition-colors",
        errors && "border-destructive focus-visible:ring-destructive",
      )}
    />
    {errors && <p className="text-sm text-destructive">{errors}</p>}
  </div>
);

const CustomIntegerControl = ({
  data,
  handleChange,
  path,
  label,
  schema,
}: ControlProps) => {
  const min = schema.minimum ?? 0;
  const max = schema.maximum ?? 100;
  const value = data ?? min;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        <span className="text-sm font-medium bg-primary/10 px-2 py-1 rounded">
          {value}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([val]) => handleChange(path, val)}
        min={min}
        max={max}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

const CustomBooleanControl = ({
  data,
  handleChange,
  path,
  label,
}: ControlProps) => (
  <div className="flex items-center justify-between rounded-lg border p-3">
    <Label htmlFor={path} className="cursor-pointer">
      {label}
    </Label>
    <Switch
      id={path}
      checked={!!data}
      onCheckedChange={(checked) => handleChange(path, checked)}
    />
  </div>
);

const CustomEnumControl = ({
  data,
  handleChange,
  path,
  label,
  schema,
  required,
}: ControlProps) => {
  const options = schema.enum as string[];

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select
        value={data || ""}
        onValueChange={(value) => handleChange(path, value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options?.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const CustomDateControl = ({
  data,
  handleChange,
  path,
  label,
  required,
}: ControlProps) => {
  const date = data ? parseISO(data) : undefined;

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive  ml-1">*</span>}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) =>
              handleChange(path, d ? format(d, "yyyy-MM-dd") : undefined)
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

const CustomTextRenderer = withJsonFormsControlProps(CustomTextControl);
const CustomIntegerRenderer = withJsonFormsControlProps(CustomIntegerControl);
const CustomBooleanRenderer = withJsonFormsControlProps(CustomBooleanControl);
const CustomEnumRenderer = withJsonFormsControlProps(CustomEnumControl);
const CustomDateRenderer = withJsonFormsControlProps(CustomDateControl);

export const customRenderers = [
  {
    tester: rankWith(
      3,
      and(isStringControl, not(isEnumControl), not(isDateControl)),
    ),
    renderer: CustomTextRenderer,
  },
  {
    tester: rankWith(3, isIntegerControl),
    renderer: CustomIntegerRenderer,
  },
  {
    tester: rankWith(3, isBooleanControl),
    renderer: CustomBooleanRenderer,
  },
  {
    tester: rankWith(3, isEnumControl),
    renderer: CustomEnumRenderer,
  },
  {
    tester: rankWith(5, isDateControl),
    renderer: CustomDateRenderer,
  },
];
