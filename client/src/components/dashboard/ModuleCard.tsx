import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ModuleCardProps } from "@/types";

export function ModuleCard({
  title,
  description,
  icon,
  buttonText,
  gradient,
  onClick
}: ModuleCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className={`h-24 ${gradient} flex items-center justify-center`}>
        <span className="material-icons text-white text-4xl">{icon}</span>
      </div>
      <CardContent className="p-5">
        <h3 className="text-base font-medium text-neutral-800 mb-2">{title}</h3>
        <p className="text-sm text-neutral-600 mb-4">{description}</p>
        <Button 
          onClick={onClick}
          variant="outline" 
          className="w-full"
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}

export default ModuleCard;
