import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface Ticket {
  id: string;
  number: number;
  createdAt: Date;
  status: 'waiting' | 'called';
  category: string;
  window?: number;
}

interface Company {
  name: string;
  logoUrl: string;
}

interface WindowCategory {
  id: string;
  name: string;
  windowNumber: number;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [companySetup, setCompanySetup] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [company, setCompany] = useState<Company>({ name: '', logoUrl: '' });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketCounter, setTicketCounter] = useState(1);
  const [view, setView] = useState<'admin' | 'display'>('admin');
  const [showLinkCopied, setShowLinkCopied] = useState(false);
  const [showPublicLinkCopied, setShowPublicLinkCopied] = useState(false);
  const [windows, setWindows] = useState<WindowCategory[]>([]);
  const [newWindowName, setNewWindowName] = useState('');
  const [newWindowNumber, setNewWindowNumber] = useState('');
  const [isAddWindowOpen, setIsAddWindowOpen] = useState(false);
  
  const displayUrl = `${window.location.origin}/display`;
  const publicUrl = `${window.location.origin}/ticket`;

  useEffect(() => {
    const savedAuth = localStorage.getItem('queueAuth');
    const savedCompany = localStorage.getItem('queueCompany');
    const savedTickets = localStorage.getItem('queueTickets');
    const savedCounter = localStorage.getItem('queueCounter');
    const savedWindows = localStorage.getItem('queueWindows');

    if (savedAuth) setIsAuthenticated(true);
    if (savedCompany) {
      const parsed = JSON.parse(savedCompany);
      setCompany(parsed);
      setCompanySetup(true);
    }
    if (savedTickets) {
      const parsed = JSON.parse(savedTickets);
      setTickets(parsed.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt)
      })));
    }
    if (savedCounter) setTicketCounter(parseInt(savedCounter));
    if (savedWindows) setWindows(JSON.parse(savedWindows));

    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      const updatedTickets = localStorage.getItem('queueTickets');
      if (updatedTickets) {
        const parsed = JSON.parse(updatedTickets);
        setTickets(parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt)
        })));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('queueAuth', 'true');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (companySetup) {
      localStorage.setItem('queueCompany', JSON.stringify(company));
    }
  }, [company, companySetup]);

  useEffect(() => {
    localStorage.setItem('queueTickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('queueCounter', ticketCounter.toString());
  }, [ticketCounter]);

  useEffect(() => {
    localStorage.setItem('queueWindows', JSON.stringify(windows));
  }, [windows]);

  const getMoscowTime = () => {
    return currentTime.toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
  };

  const handleCompanySetup = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanySetup(true);
  };

  const addWindow = () => {
    if (newWindowName && newWindowNumber) {
      const newWindow: WindowCategory = {
        id: Date.now().toString(),
        name: newWindowName,
        windowNumber: parseInt(newWindowNumber)
      };
      setWindows(prev => [...prev, newWindow]);
      setNewWindowName('');
      setNewWindowNumber('');
      setIsAddWindowOpen(false);
    }
  };

  const deleteWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  const createTicket = () => {
    const newTicket: Ticket = {
      id: `T${ticketCounter}`,
      number: ticketCounter,
      createdAt: new Date(),
      status: 'waiting',
      category: 'Общая'
    };
    
    setTickets(prev => [newTicket, ...prev].slice(0, 100));
    setTicketCounter(prev => prev + 1);
  };

  const callTicket = (id: string, windowNum: number) => {
    playNotificationSound();
    setTickets(prev => prev.map(t => 
      t.id === id ? { ...t, status: 'called', window: windowNum } : t
    ));
  };

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.frequency.value = 1000;
      oscillator2.type = 'sine';
      
      gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 0.5);
    }, 200);
  };

  const copyDisplayLink = () => {
    navigator.clipboard.writeText(displayUrl);
    setShowLinkCopied(true);
    setTimeout(() => setShowLinkCopied(false), 2000);
  };

  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setShowPublicLinkCopied(true);
    setTimeout(() => setShowPublicLinkCopied(false), 2000);
  };

  const activeTickets = tickets.filter(t => t.status === 'waiting').slice(0, 5);
  const calledTickets = tickets.filter(t => t.status === 'called').slice(0, 5);
  const historyTickets = tickets.slice(10);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Ticket" className="text-primary-foreground" size={32} />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {isRegistering ? 'Регистрация' : 'Вход в систему'}
            </CardTitle>
            <CardDescription>Электронная очередь</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@company.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {isRegistering ? 'Зарегистрироваться' : 'Войти'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Регистрация'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!companySetup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Настройка компании</CardTitle>
            <CardDescription>Введите данные вашей организации</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCompanySetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Название компании</Label>
                <Input
                  id="companyName"
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  placeholder="ООО «Название»"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">URL логотипа</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={company.logoUrl}
                  onChange={(e) => setCompany({ ...company, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Сохранить
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {company.logoUrl && (
              <img src={company.logoUrl} alt={company.name} className="h-12 w-12 object-contain" />
            )}
            <div>
              <h1 className="text-2xl font-bold">{company.name}</h1>
              <p className="text-sm text-muted-foreground">Панель управления</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold">{getMoscowTime()}</div>
            <div className="text-xs text-muted-foreground">Московское время</div>
          </div>
        </div>

        <div className="mb-4 space-y-3">
          <div className="flex gap-2">
            <Button onClick={createTicket} className="gap-2">
              <Icon name="Plus" size={18} />
              Создать талон
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-3">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Ссылка на экран очереди</Label>
                    <div className="mt-1 font-mono text-sm break-all">{displayUrl}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyDisplayLink}
                      className="gap-2 whitespace-nowrap"
                    >
                      <Icon name={showLinkCopied ? "Check" : "Copy"} size={16} />
                      {showLinkCopied ? 'Скопировано' : 'Копировать'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('/display', '_blank')}
                      className="gap-2 whitespace-nowrap"
                    >
                      <Icon name="ExternalLink" size={16} />
                      Открыть
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Публичная ссылка для клиентов</Label>
                    <div className="mt-1 font-mono text-sm break-all">{publicUrl}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyPublicLink}
                      className="gap-2 whitespace-nowrap"
                    >
                      <Icon name={showPublicLinkCopied ? "Check" : "Copy"} size={16} />
                      {showPublicLinkCopied ? 'Скопировано' : 'Копировать'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('/ticket', '_blank')}
                      className="gap-2 whitespace-nowrap"
                    >
                      <Icon name="ExternalLink" size={16} />
                      Открыть
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="tickets">Талоны</TabsTrigger>
            <TabsTrigger value="windows">Окна</TabsTrigger>
            <TabsTrigger value="history">История</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="mt-4">
            <div className="space-y-3">
              {activeTickets.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    Нет активных талонов
                  </CardContent>
                </Card>
              ) : (
                activeTickets.map((ticket) => (
                  <Card key={ticket.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold w-20">{ticket.id}</div>
                        <div>
                          <div className="font-medium">{ticket.category}</div>
                          <div className="text-sm text-muted-foreground">
                            {ticket.createdAt.toLocaleTimeString('ru-RU')}
                          </div>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="gap-2">
                            <Icon name="Bell" size={16} />
                            Вызвать
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Вызвать талон {ticket.id}</DialogTitle>
                            <DialogDescription>Выберите окно для обслуживания</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {windows.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                Сначала добавьте окна во вкладке "Окна"
                              </p>
                            ) : (
                              windows.map((window) => (
                                <Button
                                  key={window.id}
                                  variant="outline"
                                  className="w-full justify-between h-auto py-4"
                                  onClick={() => {
                                    callTicket(ticket.id, window.windowNumber);
                                    document.body.click();
                                  }}
                                >
                                  <span className="font-medium">{window.name}</span>
                                  <span className="text-2xl font-bold">№{window.windowNumber}</span>
                                </Button>
                              ))
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="windows" className="mt-4">
            <div className="space-y-3">
              <Dialog open={isAddWindowOpen} onOpenChange={setIsAddWindowOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 w-full md:w-auto">
                    <Icon name="Plus" size={18} />
                    Добавить окно
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить окно обслуживания</DialogTitle>
                    <DialogDescription>Создайте категорию с номером окна</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="windowName">Название категории</Label>
                      <Input
                        id="windowName"
                        value={newWindowName}
                        onChange={(e) => setNewWindowName(e.target.value)}
                        placeholder="Касса, Консультация, Документы..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="windowNumber">Номер окна</Label>
                      <Input
                        id="windowNumber"
                        type="number"
                        value={newWindowNumber}
                        onChange={(e) => setNewWindowNumber(e.target.value)}
                        placeholder="1"
                        min="1"
                      />
                    </div>
                    <Button onClick={addWindow} className="w-full">
                      Добавить
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {windows.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    Нет окон обслуживания
                  </CardContent>
                </Card>
              ) : (
                windows.map((window) => (
                  <Card key={window.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold w-20">№{window.windowNumber}</div>
                        <div>
                          <div className="font-medium text-lg">{window.name}</div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteWindow(window.id)}
                        className="gap-2"
                      >
                        <Icon name="Trash2" size={16} />
                        Удалить
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="space-y-2">
              {historyTickets.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    История пуста
                  </CardContent>
                </Card>
              ) : (
                historyTickets.map((ticket) => (
                  <Card key={ticket.id}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-xl font-bold w-16">{ticket.id}</div>
                        <div className="text-sm">
                          <div className="font-medium">{ticket.category}</div>
                          <div className="text-muted-foreground">
                            {ticket.createdAt.toLocaleString('ru-RU')}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm">
                        {ticket.status === 'called' && ticket.window ? (
                          <span className="font-medium">Окно №{ticket.window}</span>
                        ) : (
                          <span className="text-muted-foreground">Ожидание</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;