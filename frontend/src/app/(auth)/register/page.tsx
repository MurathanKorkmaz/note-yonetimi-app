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

const NAME_REGEX = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]{2,30}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

const VALIDATION_MESSAGES = {
  firstName: {
    required: 'Lütfen adınızı girin',
    invalid: 'Ad sadece harflerden oluşmalıdır'
  },
  lastName: {
    required: 'Lütfen soyadınızı girin',
    invalid: 'Soyad sadece harflerden oluşmalıdır'
  },
  email: {
    required: 'Lütfen e-posta adresinizi girin',
    invalid: 'Geçerli bir e-posta adresi girin'
  },
  password: {
    required: 'Lütfen şifrenizi girin',
    invalid: 'Şifre gereksinimleri karşılanmıyor'
  },
  confirmPassword: {
    required: 'Lütfen şifrenizi tekrar girin',
    mismatch: 'Şifreler eşleşmiyor'
  }
};

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validateField = (name: string, value: string) => {
    if (!value.trim()) {
      return VALIDATION_MESSAGES[name as keyof typeof VALIDATION_MESSAGES].required;
    }

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!NAME_REGEX.test(value.trim())) {
          return VALIDATION_MESSAGES[name].invalid;
        }
        break;
      case 'email':
        if (!EMAIL_REGEX.test(value)) {
          return VALIDATION_MESSAGES.email.invalid;
        }
        break;
      case 'password':
        if (!PASSWORD_REGEX.test(value)) {
          return VALIDATION_MESSAGES.password.invalid;
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          return VALIDATION_MESSAGES.confirmPassword.mismatch;
        }
        break;
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

    // Şifre değiştiğinde, confirmPassword dokunulmuşsa onu da kontrol et
    if (name === 'password' && touched.confirmPassword) {
      const confirmError = formData.confirmPassword !== value ? VALIDATION_MESSAGES.confirmPassword.mismatch : '';
      if (confirmError) {
        setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
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
      await authService.register({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim()
      });

      toast.success('Hesabınız başarıyla oluşturuldu', {
        position: 'top-center'
      });
      router.push('/login');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message, {
          position: 'top-center',
          style: {
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            border: '1px solid #DC2626'
          }
        });
      } else {
        toast.error('Kayıt olma işlemi sırasında bir hata oluştu', {
          position: 'top-center',
          style: {
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            border: '1px solid #DC2626'
          }
        });
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
            Hesap Oluştur
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Bilgilerinizi girerek hesabınızı oluşturun ve notlarınızı yönetmeye başlayın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Ad
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.firstName ? errors.firstName : undefined}
                  placeholder="Adınız"
                />
              </div>
              
              <div className="space-y-2.5">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Soyad
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.lastName ? errors.lastName : undefined}
                  placeholder="Soyadınız"
                />
              </div>
            </div>
            
            <div className="space-y-2.5">
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
              />
            </div>

            <div className="space-y-2.5">
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
              />
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">Şifreniz aşağıdaki gereksinimleri karşılamalıdır:</p>
                <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
                  <li>En az 8 karakter uzunluğunda</li>
                  <li>En az bir büyük harf</li>
                  <li>En az bir küçük harf</li>
                  <li>En az bir rakam</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2.5">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Şifre Tekrarı
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.confirmPassword ? errors.confirmPassword : undefined}
                placeholder="••••••••"
              />
            </div>

            <div className="pt-6">
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold rounded-lg bg-primary hover:bg-primary-600 transition-colors" 
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
              </Button>

              <div className="mt-6 text-center text-sm text-gray-600">
                Zaten hesabınız var mı?{' '}
                <Link 
                  href="/login" 
                  className="font-semibold text-primary hover:text-primary-600 hover:underline transition-colors"
                >
                  Giriş Yap
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
} 