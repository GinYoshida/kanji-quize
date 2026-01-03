import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface HelpGuideProps {
  titleJa: string;
  titleEn: string;
  contentJa: string[];
  contentEn: string[];
  language: "ja" | "en";
}

/**
 * HelpGuide component provides a consistent help button and dialog for each page.
 */
export function HelpGuide({ titleJa, titleEn, contentJa, contentEn, language }: HelpGuideProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-primary/10 text-primary transition-colors"
          data-testid="button-help"
        >
          <HelpCircle className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-[2rem] border-4 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold text-primary text-center">
            {language === "ja" ? titleJa : titleEn}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {(language === "ja" ? contentJa : contentEn).map((text, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
