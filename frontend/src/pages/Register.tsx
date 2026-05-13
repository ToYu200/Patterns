import React, { useState } from 'react';
import { Alert, Button, Card, Container, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs">
      <Card withBorder padding="lg">
        <Title order={2}>Регистрация</Title>
        <form onSubmit={submit}>
          <Stack mt="md">
            {error && <Alert color="red">{error}</Alert>}
            <TextInput label="Никнейм" value={username} onChange={(event) => setUsername(event.currentTarget.value)} required />
            <TextInput label="Email" value={email} onChange={(event) => setEmail(event.currentTarget.value)} required />
            <PasswordInput label="Пароль" value={password} onChange={(event) => setPassword(event.currentTarget.value)} required />
            <Button type="submit" loading={loading}>Зарегистрироваться</Button>
            <Button component={Link} to="/login" variant="subtle">Уже есть аккаунт</Button>
          </Stack>
        </form>
      </Card>
    </Container>
  );
};

export default Register;
