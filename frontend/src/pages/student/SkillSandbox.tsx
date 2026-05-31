import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { BrainCircuit, Play, CheckCircle2, XCircle } from "lucide-react";

export default function SkillSandbox() {
  const [code, setCode] = useState(
    'from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/hello")\ndef hello():\n    # Fix this route to return {"message": "Hello World"}\n    pass\n'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ passed: boolean; feedback: string; score: number } | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/api/skills/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challenge_id: "fastapi_basics_01",
          code,
          language: "python"
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.passed) {
        toast.success("Challenge Passed! Skill validated.");
      } else {
        toast.error("Challenge Failed. See feedback.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to validate code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
          <BrainCircuit className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proof-of-Skill Sandbox</h1>
          <p className="text-muted-foreground mt-1">Validate your skills in real-time to earn verified badges.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Challenge Description */}
        <Card className="lg:col-span-1 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              FastAPI Basics
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Python</span>
            </CardTitle>
            <CardDescription>
              Time Limit: 15 minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm dark:prose-invert">
              <p>
                A junior developer left this FastAPI route incomplete. Your task is to complete the <code>/hello</code> endpoint so that it returns a JSON response:
              </p>
              <pre className="bg-muted p-2 rounded-md">
                <code>{`{ "message": "Hello World" }`}</code>
              </pre>
            </div>

            {result && (
              <div className={`mt-6 p-4 rounded-lg border ${result.passed ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.passed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  <h3 className="font-semibold">{result.passed ? 'Success' : 'Failed'}</h3>
                </div>
                <p className="text-sm">{result.feedback}</p>
                <div className="mt-3 pt-3 border-t border-current/10 flex justify-between text-sm font-medium">
                  <span>Score</span>
                  <span>{result.score} / 100</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Code Editor */}
        <Card className="lg:col-span-2 border-border/50 shadow-sm flex flex-col overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 py-3">
            <div className="flex justify-between items-center">
              <div className="font-medium text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                main.py
              </div>
              <Button size="sm" onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Run & Validate
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-grow h-[500px]">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 24,
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                formatOnPaste: true,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
