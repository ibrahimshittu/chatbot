"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLLMStore } from "@/store/llm-store";

const options = ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"];

export function ModelOptions() {
  const { selectedModel, setSelectedModel } = useLLMStore();

  const handleSelectModel = (model: string) => {
    setSelectedModel(model);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {selectedModel.length ? selectedModel : "Select Model"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>LLM Models</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {options.map((model) => (
            <DropdownMenuItem
              key={model}
              onSelect={() => handleSelectModel(model)}
            >
              <span>{model}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
