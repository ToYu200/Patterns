import React, { useState } from 'react';
import { Alert, Button, Card, Container, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('zerocool@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs">
      <Card withBorder padding="lg">
        <Title order={2}>Вход</Title>
        <Text size="sm" c="dimmed" mt={4}>
          Для seed-пользователей пароль: password123
        </Text>
        <form onSubmit={submit}>
          <Stack mt="md">
            {error && <Alert color="red">{error}</Alert>}
            <TextInput label="Email" value={email} onChange={(event) => setEmail(event.currentTarget.value)} required />
            <PasswordInput label="Пароль" value={password} onChange={(event) => setPassword(event.currentTarget.value)} required />
            <Button type="submit" loading={loading}>Войти</Button>
            <Button component={Link} to="/register" variant="subtle">Создать аккаунт</Button>
          </Stack>
        </form>
      </Card>
    </Container>
  );
};

export default Login;
