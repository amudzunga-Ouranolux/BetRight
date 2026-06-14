# Theme Tokens

Each theme should expose:

```ts
type ThemeTokens = {
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    display: string;
    body: string;
    number: string;
  };
};
```
