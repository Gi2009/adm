import { useState } from 'react';
import TicketList, { Ticket } from '../components/TicketList';
import TicketForm from '../components/TicketForm';
import ChatInterface from '../components/ChatInterface';

// Export default (mais comum para componentes de página)
export default function Home() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [refreshList, setRefreshList] = useState(false);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Sistema de Suporte
      </h1>

      {!selectedTicket ? (
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Meus Tickets</h2>
          <TicketForm onCreated={() => setRefreshList(prev => !prev)} />
          <TicketList 
            onSelect={setSelectedTicket} 
            //refresh={refreshList}
          />
        </section>
      ) : (
        <section className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Ticket: {selectedTicket.title}
            </h2>
            <button
              onClick={() => setSelectedTicket(null)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Voltar para lista
            </button>
          </div>
          <div className="flex-1 min-h-[500px]">
            <ChatInterface ticketId={selectedTicket.id} />
          </div>
        </section>
      )}
    </main>
  );
}