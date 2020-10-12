import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import {
  isToday,
  format,
  parseISO,
  isAfter,
  formatISO,
  formatISO9075,
} from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import DayPicker, { DayModifiers } from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';
import * as Yup from 'yup';

import { FiArrowLeft, FiClock, FiPower, FiUser, FiPhone } from 'react-icons/fi';

import { Link, useHistory, useLocation } from 'react-router-dom';
import {
  Container,
  Header,
  HeaderContent,
  Profile,
  Content,
  Schedule,
  NextAppointment,
  Section,
  Appointment,
  Calendar,
  HoursAvailable,
  Title,
  SectionContent,
  Hour,
  AppointmentDataContainer,
} from './styles';

import { useAuth } from '../../hooks/auth';
import api from '../../services/api';
import { useToast } from '../../hooks/toast';
import getValidationErrors from '../../utils/getValidationErrors';
import Button from '../../components/Button';
import Input from '../../components/Input';

interface MonthAvailabilityItem {
  day: number;
  available: boolean;
}

interface DayAvailabilityItem {
  hour: number;
  fullHour: string;
  fullHourAvailable: boolean;
  halfHour: string;
  halfHourAvailable: boolean;
}

interface Appointment {
  id: string;
  date: string;
  hourFormatted: string;
  user: {
    name: string;
    avatar_url: string;
    phone: string;
  };
  phone: string;
  name: string;
}

interface RouteLocation {
  providerId: string;
}

interface AppointmentData {
  provider_id: string;
  date: Date;
  name: string;
  phone: string;
}

const Dashboard: React.FC = () => {
  const formRef = useRef<FormHandles>(null);

  const { signOut, user } = useAuth();

  const { addToast } = useToast();

  const history = useHistory();

  const { state } = useLocation();
  const { providerId } = state as RouteLocation;

  const [selectedHour, setSelectedHour] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [loading, setLoading] = useState(false);

  const [monthAvailability, setMonthAvailability] = useState<
    MonthAvailabilityItem[]
  >([]);

  const [dayAvailability, setDayAvailability] = useState<DayAvailabilityItem[]>(
    [],
  );

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const handleDayChange = useCallback((day, modifiers: DayModifiers) => {
    if (modifiers.available && !modifiers.disabled) {
      setSelectedDate(day);
    }
  }, []);

  const handleMonthChange = useCallback((month: Date) => {
    setCurrentMonth(month);
  }, []);

  const handleSubmit = useCallback(
    async (data: AppointmentData) => {
      setLoading(true);
      try {
        formRef.current?.setErrors({});
        const schema = Yup.object().shape({
          name: Yup.string().required('Nome é obrigatório'),
          phone: Yup.string().required('Telefone é obrigatório'),
        });

        await schema.validate(data, { abortEarly: false });

        const [hour, minute] = selectedHour.split(':');
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();

        const date = new Date(
          year,
          month,
          day,
          Number(hour),
          Number(minute),
        ).toISOString();
        console.log(date);
        console.log(
          formatISO9075(
            new Date(year, month, day, Number(hour), Number(minute)),
          ),
        );

        console.log(
          new Date(
            year,
            month,
            day,
            Number(hour),
            Number(minute),
          ).toISOString(),
        );

        await api.post('/appointments', {
          name: data.name,
          phone: data.phone,
          provider_id: providerId,
          date,
        });

        addToast({
          type: 'success',
          title: 'Agendamento concluído',
          description: 'O Agendamento foi marcado com sucesso!',
        });
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        addToast({
          type: 'error',
          title: 'Erro ao criar agendamento',
          description:
            'Ocorreu um erro ao criar um agendamento, tente novamente!',
        });
      } finally {
        setLoading(false);
        history.goBack();
      }
    },
    [addToast, history, providerId, selectedDate, selectedHour],
  );

  useEffect(() => {
    if (providerId) {
      api
        .get(`/providers/${providerId}/month-availability`, {
          params: {
            year: currentMonth.getFullYear(),
            month: currentMonth.getMonth() + 1,
          },
        })
        .then(response => {
          setMonthAvailability(response.data);
        });
    }
  }, [currentMonth, providerId]);

  useEffect(() => {
    if (providerId) {
      api
        .get(`/providers/${providerId}/day-availability`, {
          params: {
            year: selectedDate.getFullYear(),
            month: selectedDate.getMonth() + 1,
            day: selectedDate.getDate(),
          },
        })
        .then(response => {
          setDayAvailability(response.data);
        });
      setSelectedHour('');
    }
  }, [selectedDate, providerId]);

  useEffect(() => {
    if (providerId) {
      api
        .get<Appointment[]>('/appointments/me', {
          params: {
            year: selectedDate.getFullYear(),
            month: selectedDate.getMonth() + 1,
            day: selectedDate.getDate(),
            providerId,
          },
        })
        .then(response => {
          const appointmentsFormatted = response.data.map(appointment => {
            return {
              ...appointment,
              hourFormatted: format(parseISO(appointment.date), 'HH:mm'),
              // user: {
              //   ...appointment.user,
              //   phone: appointment.user.phone
              //     .replace(/\D/g, '')
              //     .replace(/(\d{2})(\d)/, '($1) $2')
              //     .replace(/(\d{4})(\d)/, '$1-$2')
              //     .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
              //     .replace(/(-\d{4})\d+?$/, '$1'),
              // },
              phone: appointment.phone
                .replace(/\D/g, '')
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{4})(\d)/, '$1-$2')
                .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
                .replace(/(-\d{4})\d+?$/, '$1'),
            };
          });
          setAppointments(appointmentsFormatted);
        });
    }
  }, [selectedDate, providerId]);

  const morningAvailability = useMemo(() => {
    return dayAvailability
      .filter(({ hour }) => hour < 12)
      .map(
        ({
          hour,
          fullHour,
          fullHourAvailable,
          halfHour,
          halfHourAvailable,
        }) => {
          return {
            hour,
            fullHour,
            fullHourAvailable,
            halfHour,
            halfHourAvailable,
          };
        },
      );
  }, [dayAvailability]);

  const afternoonAvailability = useMemo(() => {
    return dayAvailability
      .filter(({ hour }) => hour >= 12)
      .map(
        ({
          hour,
          fullHour,
          fullHourAvailable,
          halfHour,
          halfHourAvailable,
        }) => {
          return {
            hour,
            fullHour,
            fullHourAvailable,
            halfHour,
            halfHourAvailable,
          };
        },
      );
  }, [dayAvailability]);

  const disabledDays = useMemo(() => {
    const dates = monthAvailability
      .filter(monthDay => monthDay.available === false)
      .map(monthDay => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        return new Date(year, month, monthDay.day);
      });

    return dates;
  }, [currentMonth, monthAvailability]);

  const selectedDateAsText = useMemo(() => {
    return format(selectedDate, "'Dia' dd 'de' MMMM", { locale: ptBR });
  }, [selectedDate]);

  const selectedWeekDay = useMemo(() => {
    return format(selectedDate, 'cccc', { locale: ptBR });
  }, [selectedDate]);

  const morningAppointments = useMemo(() => {
    return appointments
      .filter(appointment => {
        return parseISO(appointment.date).getHours() < 12;
      })
      .sort(
        (appointment1, appointment2) =>
          +new Date(appointment1.date) - +new Date(appointment2.date),
      );
  }, [appointments]);

  const afternoonAppointments = useMemo(() => {
    return appointments
      .filter(appointment => {
        return parseISO(appointment.date).getHours() >= 12;
      })
      .sort(
        (appointment1, appointment2) =>
          +new Date(appointment1.date) - +new Date(appointment2.date),
      );
  }, [appointments]);

  const nextAppointment = useMemo(() => {
    return appointments.find(appointment =>
      isAfter(parseISO(appointment.date), new Date()),
    );
  }, [appointments]);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <header>
            <div>
              <Link to="/home">
                <FiArrowLeft />
              </Link>
            </div>
          </header>
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
          <h1>Horários agendados</h1>
          <p>
            {isToday(selectedDate) && <span>Hoje</span>}
            <span>{selectedDateAsText}</span>
            <span>{selectedWeekDay}</span>
          </p>

          {isToday(selectedDate) && nextAppointment && (
            <NextAppointment>
              <strong>Agendamento a seguir</strong>
              <div>
                <img
                  src={nextAppointment.user.avatar_url}
                  alt={nextAppointment.user.name}
                />

                <div>
                  <strong>{nextAppointment.name}</strong>
                  <p>{nextAppointment.phone}</p>
                </div>
                <span>
                  <FiClock />
                  {nextAppointment.hourFormatted}
                </span>
              </div>
            </NextAppointment>
          )}
          <Section>
            <strong>Manhã</strong>

            {morningAppointments.length === 0 && (
              <p>Nenhum agendamento nesse período</p>
            )}

            {morningAppointments.map(appointment => (
              <Appointment key={appointment.id}>
                <span>
                  <FiClock />
                  {appointment.hourFormatted}
                </span>

                <div>
                  <img
                    src={appointment.user.avatar_url}
                    alt={appointment.user.name}
                  />

                  <div>
                    <strong>{appointment.name}</strong>
                    <p>{appointment.phone}</p>
                  </div>
                </div>
              </Appointment>
            ))}
          </Section>

          <Section>
            <strong>Tarde</strong>

            {afternoonAppointments.length === 0 && (
              <p>Nenhum agendamento nesse período</p>
            )}

            {afternoonAppointments.map(appointment => (
              <Appointment key={appointment.id}>
                <span>
                  <FiClock />
                  {appointment.hourFormatted}
                </span>

                <div>
                  <img
                    src={appointment.user.avatar_url}
                    alt={appointment.user.name}
                  />

                  <div>
                    <strong>{appointment.name}</strong>
                    <p>{appointment.phone}</p>
                  </div>
                </div>
              </Appointment>
            ))}
          </Section>
        </Schedule>
        <Calendar>
          <DayPicker
            weekdaysShort={['D', 'S', 'T', 'Q', 'Q', 'S', 'S']}
            fromMonth={new Date()}
            disabledDays={[{ daysOfWeek: [0] }, ...disabledDays]}
            modifiers={{
              available: { daysOfWeek: [1, 2, 3, 4, 5, 6] },
            }}
            onMonthChange={handleMonthChange}
            selectedDays={selectedDate}
            onDayClick={handleDayChange}
            months={[
              'Janeiro',
              'Fevereiro',
              'Março',
              'Abril',
              'Maio',
              'Junho',
              'Julho',
              'Agosto',
              'Setembro',
              'Outubro',
              'Novembro',
              'Dezembro',
            ]}
          />

          <HoursAvailable>
            <Title>Escolha o horário</Title>
            <Section>
              <strong>Manhã</strong>

              <SectionContent>
                {morningAvailability.map(
                  ({
                    hour,
                    fullHour,
                    halfHour,
                    fullHourAvailable,
                    halfHourAvailable,
                  }) => (
                    <div key={hour}>
                      <Hour
                        key={fullHour}
                        selected={selectedHour === fullHour}
                        available={fullHourAvailable}
                        disabled={!fullHourAvailable}
                        onClick={() => setSelectedHour(fullHour)}
                      >
                        <p>{fullHour}</p>
                      </Hour>
                      <Hour
                        key={halfHour}
                        selected={selectedHour === halfHour}
                        available={halfHourAvailable}
                        disabled={!halfHourAvailable}
                        onClick={() => setSelectedHour(halfHour)}
                      >
                        <p>{halfHour}</p>
                      </Hour>
                    </div>
                  ),
                )}
              </SectionContent>
            </Section>

            <Section>
              <strong>Tarde</strong>

              <SectionContent>
                {afternoonAvailability.map(
                  ({
                    hour,
                    fullHour,
                    halfHour,
                    fullHourAvailable,
                    halfHourAvailable,
                  }) => (
                    <div key={hour}>
                      <Hour
                        key={fullHour}
                        selected={selectedHour === fullHour}
                        available={fullHourAvailable}
                        disabled={!fullHourAvailable}
                        onClick={() => setSelectedHour(fullHour)}
                      >
                        <p>{fullHour}</p>
                      </Hour>
                      <Hour
                        key={halfHour}
                        selected={selectedHour === halfHour}
                        available={halfHourAvailable}
                        disabled={!halfHourAvailable}
                        onClick={() => setSelectedHour(halfHour)}
                      >
                        <p>{halfHour}</p>
                      </Hour>
                    </div>
                  ),
                )}
              </SectionContent>
            </Section>
            {selectedHour && (
              <AppointmentDataContainer>
                <Form ref={formRef} onSubmit={handleSubmit}>
                  <Input name="name" icon={FiUser} placeholder="Nome" />
                  <Input name="phone" icon={FiPhone} placeholder="Telefone" />

                  <Button loading={loading} type="submit">
                    Agendar
                  </Button>
                </Form>
              </AppointmentDataContainer>
            )}
          </HoursAvailable>
        </Calendar>
      </Content>
    </Container>
  );
};

export default Dashboard;
