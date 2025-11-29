import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Company {
  name: string;
  logoUrl: string;
}

interface WindowCategory {
  id: string;
  name: string;
  windowNumber: number;
}

interface Ticket {
  id: string;
  number: number;
  createdAt: Date;
  status: 'waiting' | 'called';
  category: string;
  window?: number;
}

const TicketPage = () => {
  const [company, setCompany] = useState<Company>({ name: '', logoUrl: '' });
  const [windows, setWindows] = useState<WindowCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<WindowCategory | null>(null);
  const [generatedTicket, setGeneratedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const savedCompany = localStorage.getItem('queueCompany');
    const savedWindows = localStorage.getItem('queueWindows');
    
    if (savedCompany) {
      setCompany(JSON.parse(savedCompany));
    }
    if (savedWindows) {
      setWindows(JSON.parse(savedWindows));
    }
  }, []);

  const generateTicket = (category: WindowCategory) => {
    const savedTickets = localStorage.getItem('queueTickets');
    const savedCounter = localStorage.getItem('queueCounter');
    
    let tickets: Ticket[] = [];
    let counter = 1;
    
    if (savedTickets) {
      const parsed = JSON.parse(savedTickets);
      tickets = parsed.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt)
      }));
    }
    
    if (savedCounter) {
      counter = parseInt(savedCounter);
    }

    const newTicket: Ticket = {
      id: `T${counter}`,
      number: counter,
      createdAt: new Date(),
      status: 'waiting',
      category: category.name
    };

    tickets = [newTicket, ...tickets].slice(0, 100);
    
    localStorage.setItem('queueTickets', JSON.stringify(tickets));
    localStorage.setItem('queueCounter', (counter + 1).toString());
    
    setGeneratedTicket(newTicket);
  };

  const resetView = () => {
    setSelectedCategory(null);
    setGeneratedTicket(null);
  };

  if (generatedTicket) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="h-20 w-20 object-contain" />
              ) : (
                <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Ticket" className="text-primary-foreground" size={40} />
                </div>
              )}
            </div>
            <CardTitle className="text-3xl font-bold mb-2">Ваш талон</CardTitle>
            <div className="text-6xl font-bold text-primary my-6">
              {generatedTicket.id}
            </div>
            <CardDescription className="text-lg">
              {generatedTicket.category}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Время получения</p>
              <p className="font-medium">
                {generatedTicket.createdAt.toLocaleTimeString('ru-RU')}
              </p>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm text-center">
                Ожидайте вызова на табло. Номер окна будет отображён при вызове.
              </p>
            </div>
            <Button onClick={resetView} variant="outline" className="w-full">
              Получить новый талон
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="h-16 w-16 object-contain" />
              ) : (
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Ticket" className="text-primary-foreground" size={32} />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold">{selectedCategory.name}</CardTitle>
            <CardDescription>Окно №{selectedCategory.windowNumber}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => generateTicket(selectedCategory)} 
              className="w-full h-20 text-xl gap-3"
            >
              <Icon name="Ticket" size={24} />
              Получить талон
            </Button>
            <Button onClick={resetView} variant="outline" className="w-full">
              Назад к категориям
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="h-16 w-16 object-contain" />
            ) : (
              <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Ticket" className="text-primary-foreground" size={32} />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {company.name || 'Электронная очередь'}
          </CardTitle>
          <CardDescription>Выберите категорию обслуживания</CardDescription>
        </CardHeader>
        <CardContent>
          {windows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="AlertCircle" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Категории пока не добавлены</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {windows.map((window) => (
                <Button
                  key={window.id}
                  variant="outline"
                  onClick={() => setSelectedCategory(window)}
                  className="h-24 flex flex-col items-center justify-center gap-2 text-lg"
                >
                  <span className="font-semibold">{window.name}</span>
                  <span className="text-2xl font-bold text-primary">№{window.windowNumber}</span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketPage;
