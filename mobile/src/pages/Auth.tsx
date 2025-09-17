import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ForgotPassword } from "@/components/auth/ForgotPassword";
import { Card } from "@/components/ui/card";


import logo from "../assets/logo.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
   if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;}

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl"></div>
      </div>

      <Card className="w-full max-w-md relative bg-card/90 backdrop-blur-sm border-border/50 shadow-[var(--shadow-nature)]">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <img 
  src="/kanoa_logo.png" 
  alt="Logo" 
  className="w-25 h-25 object-contain rounded-full" 
/>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin 
                ? "Conecte-se com a natureza e povos tradicionais" 
                : "Junte-se à nossa comunidade sustentável"
              }
            </p>
          </div>

          {/* Forms */}
          <div className="space-y-4">
            {isLogin ? <LoginForm /> : <SignUpForm />}
          </div>
               {/* Forgot password link - only show on login */}
          {isLogin && (
            <div className="text-center">
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Esqueceu sua senha?
              </button>
            </div>
          )}


          {/* Toggle */}
          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin 
                ? "Não tem uma conta? Cadastre-se" 
                : "Já tem uma conta? Faça login"
              }
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Auth;