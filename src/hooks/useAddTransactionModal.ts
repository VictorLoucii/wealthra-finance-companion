import { useState, useEffect, useRef } from "react";
import { Platform, Keyboard } from "react-native";
import { useFinanceStore, Transaction } from "../store/useFinanceStore";
import { COLORS } from "../constants/color";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HookParams {
  isVisible: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
}

export const useAddTransactionModal = ({
  isVisible,
  onClose,
  editingTransaction,
}: HookParams) => {
  const theme = useFinanceStore((state) => state.theme) || "light";
  const colors = COLORS[theme];
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const editTransaction = useFinanceStore((state) => state.editTransaction);
  const lastUsedType =
    useFinanceStore((state) => state.lastUsedType) || "income";
  const setLastUsedType = useFinanceStore((state) => state.setLastUsedType);

  const insets = useSafeAreaInsets();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<"income" | "expense">("income");

  const [keyboardPadding, setKeyboardPadding] = useState(0);
  const isKeyboardActive = useRef(false);
  const [isNotesFocused, setIsNotesFocused] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        if (Platform.OS === "android") {
          isKeyboardActive.current = true;
          setKeyboardPadding(e.endCoordinates.height);
          if (__DEV__) {
            console.log("[DEBUG] keyboardDidShow fired. Height:", e.endCoordinates.height);
          }
        }
      },
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        if (Platform.OS === "android") {
          isKeyboardActive.current = false;
          setKeyboardPadding(0);
          if (__DEV__) {
            console.log("[DEBUG] keyboardDidHide fired.");
          }
        }
      },
    );

    const changeSubscription = Keyboard.addListener(
      "keyboardDidChangeFrame",
      (e) => {
        if (Platform.OS === "android") {
          if (__DEV__) {
            console.log(
              "[DEBUG] keyboardDidChangeFrame. Active:",
              isKeyboardActive.current,
              "Height:",
              e.endCoordinates.height,
              "ScreenY:",
              e.endCoordinates.screenY
            );
          }
          if (isKeyboardActive.current) {
            setKeyboardPadding(e.endCoordinates.height);
          }
        }
      },
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      changeSubscription.remove();
    };
  }, []);

  // Sync state when editingTransaction changes or modal opens
  useEffect(() => {
    if (isVisible && editingTransaction) {
      setAmount(parseFloat(editingTransaction.amount.toFixed(2)).toString());
      setCategory(editingTransaction.category === "Food" ? "Eat Out" : editingTransaction.category);
      setNotes(editingTransaction.notes || "");
      setType(editingTransaction.type);
    } else if (isVisible && !editingTransaction) {
      setAmount("");
      setCategory("General");
      setNotes("");
      setType(lastUsedType);
    }
  }, [isVisible, editingTransaction, lastUsedType]);

  const isAmountValid = parseFloat(amount) >= 0.1;
  const isCategorySelected = category !== "General";
  const hasNote = notes.trim().length > 0;
  const isFormValid = isAmountValid && (isCategorySelected || hasNote);

  const showNoteHint = isAmountValid && !isCategorySelected && !hasNote;

  if (__DEV__) {
    const calcPadding = Platform.OS === "android"
      ? keyboardPadding > 0
        ? keyboardPadding + (showNoteHint ? 16 : 64) + (isNotesFocused ? 50 : 0)
        : 40
      : 40;
    console.log(
      "[DEBUG] Render - keyboardPadding:",
      keyboardPadding,
      "showNoteHint:",
      showNoteHint,
      "isNotesFocused:",
      isNotesFocused,
      "calcPadding:",
      calcPadding,
      "isKeyboardActive:",
      isKeyboardActive.current
    );
  }

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (!isFormValid) return;

    if (editingTransaction) {
      editTransaction(editingTransaction.id, {
        amount: parsedAmount,
        type,
        category,
        notes: notes.trim() || undefined,
      });
    } else {
      addTransaction({
        amount: parsedAmount,
        type,
        category,
        notes: notes.trim() || undefined,
        date: new Date().toISOString(),
      });
      if (setLastUsedType) setLastUsedType(type);
    }

    onClose();
  };

  return {
    colors,
    theme,
    insets,
    amount,
    setAmount,
    category,
    setCategory,
    notes,
    setNotes,
    type,
    setType,
    keyboardPadding,
    isNotesFocused,
    setIsNotesFocused,
    isFormValid,
    showNoteHint,
    handleSave,
    isCategorySelected,
  };
};
