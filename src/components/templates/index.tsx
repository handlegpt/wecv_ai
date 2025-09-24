import ClassicTemplate from "./ClassicTemplate";
import ModernTemplate from "./ModernTemplate";
import LeftRightTemplate from "./LeftRightTemplate";
import TimelineTemplate from "./TimelineTemplate";
import CardTemplate from "./CardTemplate";
import { ResumeData } from "@/types/resume";
import { ResumeTemplate } from "@/types/template";

interface TemplateProps {
  data: ResumeData;
  template: ResumeTemplate;
}

const templates = {
  classic: ClassicTemplate,
  "classic-blue": ClassicTemplate,
  "classic-green": ClassicTemplate,
  modern: ModernTemplate,
  "modern-purple": ModernTemplate,
  "left-right": LeftRightTemplate,
  "left-right-orange": LeftRightTemplate,
  timeline: TimelineTemplate,
  card: CardTemplate,
  "card-blue": CardTemplate,
};

export default templates;
