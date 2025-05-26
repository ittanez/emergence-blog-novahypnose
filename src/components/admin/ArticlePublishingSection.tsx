
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface ArticlePublishingSectionProps {
  publishMode: "draft" | "publish" | "schedule";
  scheduledDate: Date | undefined;
  onPublishModeChange: (mode: "draft" | "publish" | "schedule") => void;
  onScheduledDateChange: (date: Date | undefined) => void;
}

const ArticlePublishingSection = ({
  publishMode,
  scheduledDate,
  onPublishModeChange,
  onScheduledDateChange,
}: ArticlePublishingSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Publication</h3>
      
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="draft"
            name="publishMode"
            checked={publishMode === "draft"}
            onChange={() => onPublishModeChange("draft")}
          />
          <Label htmlFor="draft" className="cursor-pointer">
            Enregistrer comme brouillon
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="publish"
            name="publishMode"
            checked={publishMode === "publish"}
            onChange={() => onPublishModeChange("publish")}
          />
          <Label htmlFor="publish" className="cursor-pointer">
            Publier immédiatement
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="schedule"
            name="publishMode"
            checked={publishMode === "schedule"}
            onChange={() => onPublishModeChange("schedule")}
          />
          <Label htmlFor="schedule" className="cursor-pointer">
            Programmer la publication
          </Label>
          
          {publishMode === "schedule" && (
            <div className="ml-6">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "PPP", { locale: fr }) : "Choisir une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={onScheduledDateChange}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticlePublishingSection;
