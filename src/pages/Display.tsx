import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const Display = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [company, setCompany] = useState<Company>({ name: '', logoUrl: '' });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [lastCalledCount, setLastCalledCount] = useState(0);

  useEffect(() => {
    const savedCompany = localStorage.getItem('queueCompany');
    if (savedCompany) {
      setCompany(JSON.parse(savedCompany));
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      const savedTickets = localStorage.getItem('queueTickets');
      if (savedTickets) {
        const parsed = JSON.parse(savedTickets);
        const ticketsData = parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt)
        }));
        setTickets(ticketsData);

        const calledCount = ticketsData.filter((t: Ticket) => t.status === 'called').length;
        if (calledCount > lastCalledCount) {
          playNotificationSound();
          setLastCalledCount(calledCount);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastCalledCount]);

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

  const activeTickets = tickets.filter(t => t.status === 'waiting').slice(0, 5);
  const calledTickets = tickets.filter(t => t.status === 'called').slice(0, 5);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {company.logoUrl && (
              <img src={company.logoUrl} alt={company.name} className="h-16 w-16 object-contain" />
            )}
            <h1 className="text-3xl font-bold">{company.name || 'Электронная очередь'}</h1>
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
                      <div className="text-5xl font-bold text-center mb-2">
                        {ticket.id}
                      </div>
                      <div className="text-sm text-center text-muted-foreground">
                        {ticket.category}
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
                  <div className="text-center py-12 opacity-70">
                    Нет вызванных талонов
                  </div>
                ) : (
                  calledTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-primary text-primary-foreground p-6 rounded-lg animate-pulse"
                    >
                      <div className="text-5xl font-bold text-center mb-2">
                        {ticket.id}
                      </div>
                      {ticket.window && (
                        <div className="text-3xl font-bold text-center">
                          Окно №{ticket.window}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Display;