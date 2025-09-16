"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, MessageCircle, User, Shield } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "admin"
  timestamp: Date
  senderName: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Olá! Como posso ajudá-lo hoje?",
      sender: "admin",
      timestamp: new Date(Date.now() - 300000),
      senderName: "Suporte",
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
      senderName: "Você",
    }

    setMessages((prev) => [...prev, userMessage])
    setNewMessage("")
    setIsTyping(true)

    // Simular resposta do administrador
    setTimeout(() => {
      const adminMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Obrigado pela sua mensagem! Um administrador irá responder em breve.",
        sender: "admin",
        timestamp: new Date(),
        senderName: "Suporte",
      }
      setMessages((prev) => [...prev, adminMessage])
      setIsTyping(false)
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Chat de Suporte</h1>
            <p className="text-sm text-muted-foreground">Conecte-se com nossa equipe de administradores</p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            Online
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            {message.sender === "admin" && (
              <Avatar className="h-8 w-8 bg-primary/10">
                <AvatarFallback>
                  <Shield className="h-4 w-4 text-primary" />
                </AvatarFallback>
              </Avatar>
            )}

            <div className={`max-w-xs lg:max-w-md ${message.sender === "user" ? "order-1" : "order-2"}`}>
              <Card
                className={`p-3 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-card text-card-foreground"
                }`}
              >
                <div className="text-sm leading-relaxed">{message.content}</div>
              </Card>
              <div
                className={`text-xs text-muted-foreground mt-1 ${
                  message.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                {message.senderName} •{" "}
                {message.timestamp.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {message.sender === "user" && (
              <Avatar className="h-8 w-8 bg-secondary/10 order-2">
                <AvatarFallback>
                  <User className="h-4 w-4 text-secondary-foreground" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 justify-start">
            <Avatar className="h-8 w-8 bg-primary/10">
              <AvatarFallback>
                <Shield className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <Card className="p-3 bg-card text-card-foreground">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-input border-border focus:ring-ring"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Pressione Enter para enviar • Shift + Enter para nova linha
        </p>
      </div>
    </div>
  )
}
