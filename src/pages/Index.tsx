import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Ticket {
  id: string;
  number: number;
  createdAt: Date;
  status: 'waiting' | 'called';
}

interface Company {
  name: string;
  logoUrl: string;
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  const createTicket = () => {
    const newTicket: Ticket = {
      id: `T${ticketCounter}`,
      number: ticketCounter,
      createdAt: new Date(),
      status: 'waiting'
    };
    
    setTickets(prev => [newTicket, ...prev].slice(0, 100));
    setTicketCounter(prev => prev + 1);
  };

  const callTicket = (id: string) => {
    setTickets(prev => prev.map(t => 
      t.id === id ? { ...t, status: 'called' } : t
    ));
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

  if (view === 'display') {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {company.logoUrl && (
                <img src={company.logoUrl} alt={company.name} className="h-16 w-16 object-contain" />
              )}
              <h1 className="text-3xl font-bold">{company.name}</h1>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">{getMoscowTime()}</div>
              <div className="text-sm text-muted-foreground">Московское время</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardHeader className="bg-muted">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Icon name="Clock" size={28} />
                  Ожидают
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {activeTickets.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      Нет талонов в очереди
                    </div>
                  ) : (
                    activeTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="bg-card border-2 border-border p-6 rounded-lg"
                      >
                        <div className="text-5xl font-bold text-center">
                          {ticket.id}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Icon name="User" size={28} />
                  Подойдите
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {calledTickets.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      Нет вызванных талонов
                    </div>
                  ) : (
                    calledTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="bg-primary text-primary-foreground p-6 rounded-lg animate-pulse"
                      >
                        <div className="text-5xl font-bold text-center">
                          {ticket.id}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => setView('admin')}
              className="gap-2"
            >
              <Icon name="Settings" size={18} />
              Админ-панель
            </Button>
          </div>
        </div>
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

        <div className="mb-4 flex gap-2">
          <Button onClick={() => setView('display')} className="gap-2">
            <Icon name="Monitor" size={18} />
            Открыть экран очереди
          </Button>
          <Button onClick={createTicket} className="gap-2">
            <Icon name="Plus" size={18} />
            Создать талон
          </Button>
        </div>

        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="tickets">Талоны</TabsTrigger>
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
                          <div className="font-medium">Талон #{ticket.number}</div>
                          <div className="text-sm text-muted-foreground">
                            {ticket.createdAt.toLocaleTimeString('ru-RU')}
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => callTicket(ticket.id)} className="gap-2">
                        <Icon name="Bell" size={16} />
                        Вызвать
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
                          <div className="font-medium">Талон #{ticket.number}</div>
                          <div className="text-muted-foreground">
                            {ticket.createdAt.toLocaleString('ru-RU')}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {ticket.status === 'called' ? 'Завершён' : 'Ожидание'}
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
