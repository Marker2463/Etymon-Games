import React from 'react';
import {
  HashRouter,
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { ArcadeGamePage } from './pages/ArcadeGamePage';
import { ArchivePage } from './pages/ArchivePage';
import { ArchivePlayPage } from './pages/ArchivePlayPage';
import { LexiconPage } from './pages/LexiconPage';
import { LexiconDetailPage } from './pages/LexiconDetailPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { EditorialStandardsPage } from './pages/EditorialStandardsPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { QAAudioPage } from './pages/QAAudioPage';
import { usePageMetadata } from './hooks/usePageMetadata';

export const ROUTER_MODE: 'hash' | 'browser' = 'hash';

// Wrapper component to handle route-level titles, metas, and canonical paths
const RouteSEO: React.FC<{
  title: string;
  description: string;
  canonicalPath: string;
  element: React.ReactElement;
}> = ({ title, description, canonicalPath, element }) => {
  usePageMetadata(title, description, canonicalPath);
  return element;
};

// Scroll-to-top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppRoutes() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDF8EC] text-[#1F1B16]">
      <ScrollToTop />
      <Header />
      <main className="flex-1 flex flex-col w-full">
        <Routes>
          {/* Daily Mix: "/" */}
          <Route
            path="/"
            element={
              <RouteSEO
                title="Etymon"
                description="Puzzles about English words that don't sound the way they look. Play the Daily Mix and sharpen your ear."
                canonicalPath="/"
                element={<HomePage />}
              />
            }
          />

          {/* Legacy & Alternative redirects */}
          <Route path="/daily" element={<Navigate to="/" replace />} />
          <Route path="/daily/complete" element={<Navigate to="/" replace />} />
          <Route path="/play/sound-match" element={<Navigate to="/sound-match" replace />} />
          <Route path="/play/true-or-trap" element={<Navigate to="/true-vs-trap" replace />} />
          <Route path="/play/impostor-letter" element={<Navigate to="/impostor-letter" replace />} />
          <Route path="/play/syllable-chopper" element={<Navigate to="/syllable-chopper" replace />} />

          {/* Four Arcade Modes */}
          <Route
            path="/sound-match"
            element={
              <RouteSEO
                title="Sound Match"
                description="Pair spelled words that sound identical despite discordant vowel and consonant assemblies in Sound Match arcade mode."
                canonicalPath="/sound-match"
                element={
                  <ArcadeGamePage
                    mode="sound"
                    modeTitle="Sound Match"
                    modeSlug="sound-match"
                    modeSubtitle="Read the word, then pick how it is really said."
                    keyboardHintText="Keys: 1-4 or A-D to pick answer · R to hear word"
                    aboutText="Sound Match tests your ear for English pronunciation, challenging you to recognize how words with surprising spellings sound in real speech."
                  />
                }
              />
            }
          />

          <Route
            path="/true-vs-trap"
            element={
              <RouteSEO
                title="True or Trap"
                description="Spot fabricated phonetic pronunciations before committing in True or Trap arcade mode."
                canonicalPath="/true-vs-trap"
                element={
                  <ArcadeGamePage
                    mode="trap"
                    modeTitle="True or Trap"
                    modeSlug="true-vs-trap"
                    modeSubtitle="Is this pronunciation real, or a trap?"
                    keyboardHintText="Keys: ← Left for Trap, → Right for True · R to hear"
                    aboutText="True or Trap presents an English word alongside a proposed phonetic respelling. Your task is to discern whether the pronunciation is genuine or an orthographic bluff."
                  />
                }
              />
            }
          />

          <Route
            path="/impostor-letter"
            element={
              <RouteSEO
                title="Impostor Letter"
                description="Find the letter that never gets said in Impostor Letter arcade mode."
                canonicalPath="/impostor-letter"
                element={
                  <ArcadeGamePage
                    mode="impostor"
                    modeTitle="Impostor Letter"
                    modeSlug="impostor-letter"
                    modeSubtitle="Find the letter that never gets said."
                    keyboardHintText="Keys: 1-N picks letter position · H for hint"
                    aboutText="Impostor Letter asks you to uncover the silent letter hidden inside an English word that is never pronounced."
                  />
                }
              />
            }
          />

          <Route
            path="/syllable-chopper"
            element={
              <RouteSEO
                title="Syllable Chopper"
                description="Find the written chunk that disappears when you say it in Syllable Chopper arcade mode."
                canonicalPath="/syllable-chopper"
                element={
                  <ArcadeGamePage
                    mode="chopper"
                    modeTitle="Syllable Chopper"
                    modeSlug="syllable-chopper"
                    modeSubtitle="Find the written chunk that disappears when you say it."
                    keyboardHintText="Keys: 1-N selects chunk · Enter chops · H for hint"
                    aboutText="Syllable Chopper challenges you to spot the written syllable chunk that disappears when words are spoken aloud."
                  />
                }
              />
            }
          />

          {/* Archive Routes */}
          <Route
            path="/archive"
            element={
              <RouteSEO
                title="Daily Mix Archive"
                description="Revisit and replay past Daily Mixes from the Etymon puzzle archive."
                canonicalPath="/archive"
                element={<ArchivePage />}
              />
            }
          />
          <Route
            path="/archive/:date"
            element={
              <RouteSEO
                title="Archive Daily Mix"
                description="Play an archived edition of the Etymon Daily Mix."
                canonicalPath="/archive"
                element={<ArchivePlayPage />}
              />
            }
          />

          {/* Lexicon Routes */}
          <Route
            path="/lexicon"
            element={
              <RouteSEO
                title="Lexicon"
                description="An index of English words that don't sound the way they look, with phonetic respellings and audio."
                canonicalPath="/lexicon"
                element={<LexiconPage />}
              />
            }
          />
          <Route
            path="/lexicon/:id"
            element={
              <RouteSEO
                title="Lexicon Dossier"
                description="Phonetic pronunciation guide and dictionary entry for an English word."
                canonicalPath="/lexicon"
                element={<LexiconDetailPage />}
              />
            }
          />

          {/* Editorial & Information Pages */}
          <Route
            path="/how-it-works"
            element={
              <RouteSEO
                title="How It Works"
                description="Rules, scoring mechanics, streak calculations, and keyboard shortcuts for Etymon."
                canonicalPath="/how-it-works"
                element={<HowItWorksPage />}
              />
            }
          />
          <Route
            path="/editorial-standards"
            element={
              <RouteSEO
                title="Editorial Standards"
                description="How pronunciations and respellings are curated and verified for Etymon."
                canonicalPath="/editorial-standards"
                element={<EditorialStandardsPage />}
              />
            }
          />
          <Route
            path="/contact"
            element={
              <RouteSEO
                title="Contact"
                description="Contact the editorial team behind Etymon."
                canonicalPath="/contact"
                element={<ContactPage />}
              />
            }
          />
          <Route
            path="/privacy"
            element={
              <RouteSEO
                title="Privacy"
                description="Etymon privacy policy: zero trackers, client-only local storage."
                canonicalPath="/privacy"
                element={<PrivacyPage />}
              />
            }
          />

          {/* Unlinked QA Dev Route */}
          <Route
            path="/qa/audio"
            element={
              <RouteSEO
                title="Audio QA Testboard"
                description="Internal QA listening board for speech synthesis audit."
                canonicalPath="/qa/audio"
                element={<QAAudioPage />}
              />
            }
          />

          {/* 404 Catch-All */}
          <Route
            path="*"
            element={
              <RouteSEO
                title="404 Page Not Found"
                description="The requested page does not exist."
                canonicalPath="/404"
                element={<NotFoundPage />}
              />
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const RouterComponent = ROUTER_MODE === 'hash' ? HashRouter : BrowserRouter;

  return (
    <GameProvider>
      <RouterComponent>
        <AppRoutes />
      </RouterComponent>
    </GameProvider>
  );
}
