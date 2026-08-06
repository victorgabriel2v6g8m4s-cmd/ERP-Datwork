export const formatCurrencyBRL = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

export const maskCurrencyBRL = (value: string): string => {
    const cleanValue = value.replace(/\D/g, ""); // Remove tudo que não for número
    const numberValue = Number(cleanValue) / 100;

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(numberValue);
};

export const maskCPF = (value: string): string => {
    return value
        .replace(/\D/g, "") // Remove tudo o que não é dígito
        .replace(/(\d{3})(\d)/, "$1.$2") // Adiciona o primeiro ponto
        .replace(/(\d{3})(\d)/, "$1.$2") // Adiciona o segundo ponto
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2") // Adiciona o hífen
        .substring(0, 14); // Limita o tamanho ao padrão do CPF
};

export const maskPhone = (value: string): string => {
    return value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/g, "($1) $2") // Adiciona os parênteses do DDD
        .replace(/(\d{5})(\d)/, "$1-$2") // Adiciona o hífen do celular
        .substring(0, 15);
};

export const maskCEP = (value: string): string => {
    return value
        .replace(/\D/g, "")
        .replace(/^(\d{5})(\d)/, "$1-$2") // Adiciona o hífen do bloco postal
        .substring(0, 9);
};

export const maskRG = (value: string): string => {
  return value
    .replace(/[^0-9a-zA-Z]/g, "") // Permite números e a letra X (comum em RGs)
    .replace(/(\d{2})(\d)/, "$1.$2") // Primeiro ponto
    .replace(/(\d{3})(\d)/, "$1.$2") // Segundo ponto
    .replace(/(\d{3})([\dXx]{1})$/, "$1-$2") // Hífen antes do dígito verificador
    .substring(0, 12)
    .toUpperCase(); // Garante o X maiúsculo
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
