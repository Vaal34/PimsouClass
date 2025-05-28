import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

export const NeobrutalistForm: React.FC = () => {
  const { state, setConsigne, toggleConsigneVisibility, resetConsigne, setTheme } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const consigneText = `Titre: ${formData.title}\nDescription: ${formData.description}\nEmail: ${formData.email}`;
    setConsigne(consigneText);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Formulaire principal dans une Card */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Créer une Consigne</CardTitle>
          <CardDescription>
            Remplissez le formulaire pour créer une nouvelle consigne
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                type="text"
                placeholder="Entrez le titre"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                placeholder="Entrez la description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button type="submit" className="w-full" onClick={handleSubmit}>
            Créer la Consigne
          </Button>
          <Button 
            variant="neutral" 
            className="w-full" 
            onClick={resetConsigne}
          >
            Réinitialiser
          </Button>
        </CardFooter>
      </Card>

      {/* Contrôles du contexte */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Contrôles du Contexte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              variant={state.theme === 'light' ? 'default' : 'neutral'}
              onClick={() => setTheme('light')}
            >
              Thème Clair
            </Button>
            <Button 
              variant={state.theme === 'dark' ? 'default' : 'neutral'}
              onClick={() => setTheme('dark')}
            >
              Thème Sombre
            </Button>
          </div>
          
          <Button 
            variant="noShadow" 
            className="w-full"
            onClick={toggleConsigneVisibility}
          >
            {state.isConsigneVisible ? 'Masquer' : 'Afficher'} la Consigne
          </Button>
        </CardContent>
      </Card>

      {/* Affichage de la consigne avec Dialog */}
      {state.consigne && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="neutral" className="w-full max-w-md mx-auto">
              Voir la Consigne dans un Dialog
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Consigne Actuelle</DialogTitle>
              <DialogDescription>
                Voici la consigne créée via le contexte
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-secondary-background rounded border-2 border-border">
              <pre className="whitespace-pre-wrap text-sm">{state.consigne}</pre>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Affichage conditionnel de la consigne */}
      {state.isConsigneVisible && state.consigne && (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Consigne Actuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-secondary-background rounded border-2 border-border">
              <pre className="whitespace-pre-wrap text-sm">{state.consigne}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 