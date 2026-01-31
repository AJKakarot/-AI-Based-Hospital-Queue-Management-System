"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "symptom-checker-data";

export function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showSelfCare, setShowSelfCare] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.symptoms) setSymptoms(data.symptoms);
        if (data.result) setResult(data.result);
        if (data.showSelfCare !== undefined) setShowSelfCare(data.showSelfCare);
      }
    } catch (err) {
      console.error("Failed to load saved data:", err);
    }
  }, []);

  useEffect(() => {
    try {
      const data = {
        symptoms,
        result,
        showSelfCare,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("Failed to save data:", err);
    }
  }, [symptoms, result, showSelfCare]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!symptoms.trim()) {
      setError("Please enter your symptoms");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setShowSelfCare(false);

    try {
      const response = await fetch("/api/symptom-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: symptoms.trim() }),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to get recommendation");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyClassName = (urgencyLevel) => {
    switch (urgencyLevel) {
      case "Low":
        return "bg-secondary text-secondary-foreground";
      case "Medium":
        return "bg-accent text-accent-foreground";
      case "High":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const hasSelfCareTips = result?.urgencyLevel === "Low" && result?.selfCareTips?.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="px-6 md:px-8">
          <CardTitle>AI Symptom Checker</CardTitle>
          <CardDescription className="mt-4 leading-relaxed">
            Get AI-powered doctor recommendations based on your symptoms.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 md:px-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <label htmlFor="symptoms" className="text-sm font-medium">
                Describe your symptoms
              </label>
              <Textarea
                id="symptoms"
                placeholder="e.g., persistent headaches and dizziness..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
                disabled={loading}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                You can write in English, हिंदी, or Hinglish
              </p>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                {error}
              </div>
            )}

            <div className="pt-1">
              <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Analyzing symptoms...
                </>
              ) : (
                "Get Recommendation"
              )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="relative w-full">
          <div className="relative overflow-hidden">
            <div className="flex items-stretch gap-4">
              <motion.div
                className="flex-shrink-0"
                animate={{
                  x: showSelfCare && hasSelfCareTips ? -336 : 0,
                  width: showSelfCare && hasSelfCareTips ? "calc(100% - 336px)" : "100%",
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle>Recommendation</CardTitle>
                      <div className="flex items-center gap-2">
                        {hasSelfCareTips && (
                          <button
                            type="button"
                            onClick={() => setShowSelfCare(!showSelfCare)}
                            className="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent/50"
                          >
                            <ChevronRight
                              className={cn(
                                "size-4 transition-transform duration-200",
                                showSelfCare && "rotate-90"
                              )}
                            />
                            <span className="hidden sm:inline">Tips</span>
                          </button>
                        )}
                        <Badge className={getUrgencyClassName(result.urgencyLevel)}>
                          {result.urgencyLevel} Urgency
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Recommended Doctor
                      </p>
                      <p className="text-lg font-semibold">{result.recommendedDoctor}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Reason</p>
                      <p className="text-sm">{result.reason}</p>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground italic">
                        {result.disclaimer}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <AnimatePresence>
                {showSelfCare && hasSelfCareTips && (
                  <>
                    <motion.div
                      initial={{ x: 336, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 336, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                      className="hidden md:flex flex-shrink-0 w-80"
                    >
                      <Card className="bg-card text-card-foreground border h-full">
                        <CardHeader>
                          <CardTitle className="text-base">General Self-Care Tips</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2.5">
                            {result.selfCareTips.map((tip, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="text-muted-foreground mt-0.5">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "100%", opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                      className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-card border-t shadow-lg"
                    >
                      <Card className="bg-card text-card-foreground border-0 rounded-t-xl rounded-b-none">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">General Self-Care Tips</CardTitle>
                            <button
                              type="button"
                              onClick={() => setShowSelfCare(false)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <ChevronRight className="size-4 rotate-90" />
                            </button>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-6">
                          <ul className="space-y-2.5">
                            {result.selfCareTips.map((tip, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="text-muted-foreground mt-0.5">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
