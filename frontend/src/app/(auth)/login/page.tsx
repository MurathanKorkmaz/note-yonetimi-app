'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const validateField = (name: string, value: string) => {
    if (!value.trim()) {
      return `${name === 'email' ? 'E-posta' : 'Şifre'} alanı zorunludur`;
    }
    if (name === 'email' && !EMAIL_REGEX.test(value)) {
      return 'Geçerli bir e-posta adresi giriniz';
    }
    return '';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Sadece alan daha önce dokunulmuşsa (touched) validasyon yap
    if (touched[name]) {
      const error = validateField(name, value);
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Submit sırasında tüm alanları dokunulmuş olarak işaretle
    const newTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(newTouched);

    // Tüm alanları validate et
    const newErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Lütfen tüm alanları doldurunuz', {
        position: 'top-center',
        style: {
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
          border: '1px solid #DC2626'
        }
      });
      return;
    }

    setIsLoading(true);

    try {
      await authService.login({
        email: formData.email.trim(),
        password: formData.password
      });

      toast.success('Başarıyla giriş yapıldı', {
        position: 'top-center'
      });
      router.push('/notes');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('password')) {
          setErrors(prev => ({
            ...prev,
            password: 'Şifre hatalı'
          }));
          toast.error('Girdiğiniz şifre hatalı', {
            position: 'top-center'
          });
        } else if (error.message.includes('user') || error.message.includes('email')) {
          setErrors(prev => ({
            ...prev,
            email: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı'
          }));
          toast.error('Kullanıcı bulunamadı', {
            position: 'top-center'
          });
        } else {
          toast.error('Giriş yapılırken bir hata oluştu', {
            position: 'top-center'
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="sm" className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center pb-8">
          <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
            Hoş Geldiniz
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            E-posta ve şifrenizi girerek notlarınıza erişebilirsiniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-posta
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email ? errors.email : undefined}
                placeholder="ornek@email.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Şifre
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password ? errors.password : undefined}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold rounded-lg bg-primary hover:bg-primary-600 transition-colors" 
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Hesabınız yok mu?{' '}
              <Link 
                href="/register" 
                className="font-semibold text-primary hover:text-primary-600 hover:underline transition-colors"
              >
                Hesap Oluştur
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
} 