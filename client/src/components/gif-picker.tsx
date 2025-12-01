import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Using Giphy API - you'll need to get a free API key from https://developers.giphy.com/
const GIPHY_API_KEY = "GlVGYHkr3WSBnllca54iNt0yFbjz7L65"; // This is a public beta key, replace with your own

interface GifResult {
  id: string;
  title: string;
  images: {
    fixed_height: {
      url: string;
      width: string;
      height: string;
    };
    fixed_height_small: {
      url: string;
      width: string;
      height: string;
    };
    original: {
      url: string;
      width: string;
      height: string;
    };
    preview_gif: {
      url: string;
    };
  };
}

interface GifPickerProps {
  onGifSelect: (gifUrl: string, gifId: string) => void;
  disabled?: boolean;
}

export function GifPicker({ onGifSelect, disabled }: GifPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [trending, setTrending] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch trending GIFs on mount
  useEffect(() => {
    if (open && trending.length === 0) {
      fetchTrending();
    }
  }, [open]);

  // Focus input when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const fetchTrending = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`
      );

      if (!response.ok) throw new Error("Failed to fetch trending GIFs");

      const data = await response.json();
      setTrending(data.data);
    } catch (err) {
      setError("Failed to load GIFs");
      console.error("Giphy error:", err);
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = useCallback(async (query: string) => {
    if (!query.trim()) {
      setGifs([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
          query
        )}&limit=20&rating=g`
      );

      if (!response.ok) throw new Error("Failed to search GIFs");

      const data = await response.json();
      setGifs(data.data);
    } catch (err) {
      setError("Failed to search GIFs");
      console.error("Giphy search error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchGifs(search);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search, searchGifs]);

  const handleGifClick = (gif: GifResult) => {
    onGifSelect(gif.images.fixed_height.url, gif.id);
    setOpen(false);
    setSearch("");
  };

  const displayGifs = search.trim() ? gifs : trending;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              className="h-9 w-9 shrink-0"
            >
              <span className="text-lg">GIF</span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Send a GIF</TooltipContent>
      </Tooltip>

      <PopoverContent
        className="w-80 sm:w-96 p-0"
        side="top"
        align="start"
        sideOffset={8}
      >
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search GIFs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearch("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-64">
          {loading && (
            <div className="flex items-center justify-center h-full py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center px-4">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => (search ? searchGifs(search) : fetchTrending())}
              >
                Try again
              </Button>
            </div>
          )}

          {!loading && !error && displayGifs.length === 0 && search && (
            <div className="flex items-center justify-center h-full py-8">
              <p className="text-sm text-muted-foreground">No GIFs found</p>
            </div>
          )}

          {!loading && !error && displayGifs.length > 0 && (
            <div className="p-2">
              {!search && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2 px-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Trending</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {displayGifs.map((gif) => (
                  <button
                    key={gif.id}
                    onClick={() => handleGifClick(gif)}
                    className={cn(
                      "relative overflow-hidden rounded-lg border border-transparent",
                      "hover:border-primary transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    )}
                    style={{
                      aspectRatio: `${gif.images.fixed_height_small.width} / ${gif.images.fixed_height_small.height}`,
                    }}
                  >
                    <img
                      src={gif.images.fixed_height_small.url}
                      alt={gif.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t bg-muted/30">
          <a
            href="https://giphy.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Powered by
            <img
              src="https://giphy.com/static/img/giphy_logo_square_social.png"
              alt="Giphy"
              className="h-4"
            />
            GIPHY
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}
