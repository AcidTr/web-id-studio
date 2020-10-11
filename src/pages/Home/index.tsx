import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-day-picker/lib/style.css';

import { FiPower } from 'react-icons/fi';

import { Link } from 'react-router-dom';
import {
  Container,
  Header,
  HeaderContent,
  Profile,
  Content,
  Schedule,
  BarberProvider,
} from './styles';

import logoImg from '../../assets/logo.svg';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';

interface Users {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
}

const Home: React.FC = () => {
  const { signOut, user } = useAuth();

  const [providers, setProviders] = useState<Users[]>([]);

  useEffect(() => {
    api.get<Users[]>('/providers', {}).then(response => {
      const usersFormatted = response.data.map(currentUser => {
        return {
          ...currentUser,
          phone: currentUser.phone
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
            .replace(/(-\d{4})\d+?$/, '$1'),
        };
      });
      setProviders(usersFormatted);
    });
  }, []);

  const selectedDateAsText = useMemo(() => {
    return format(new Date(), "'Dia' dd 'de' MMMM", { locale: ptBR });
  }, []);

  const selectedWeekDay = useMemo(() => {
    return format(new Date(), 'cccc', { locale: ptBR });
  }, []);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <img src={logoImg} alt="ID Studio" />
          <Profile>
            <img src={user.avatar_url} alt={user.name} />
            <div>
              <span>Bem-vindo,</span>
              <Link to="/profile">
                <strong>{user.name}</strong>
              </Link>
            </div>
          </Profile>
          <button type="button" onClick={signOut}>
            <FiPower />
          </button>
        </HeaderContent>
      </Header>
      <Content>
        <Schedule>
          <h1>Prestadores de serviços</h1>
          <p>
            <span>Hoje</span>
            <span>{selectedDateAsText}</span>
            <span>{selectedWeekDay}</span>
          </p>

          {providers.map(provider => (
            <BarberProvider key={provider.id}>
              <Link
                to={{
                  pathname: '/dashboard',
                  state: {
                    providerId: provider.id,
                  },
                }}
              >
                <div>
                  <img src={provider.avatar_url} alt={provider.name} />

                  <div>
                    <strong>{provider.name}</strong>
                    <p>{provider.phone}</p>
                  </div>
                </div>
              </Link>
            </BarberProvider>
          ))}
        </Schedule>
      </Content>
    </Container>
  );
};

export default Home;
