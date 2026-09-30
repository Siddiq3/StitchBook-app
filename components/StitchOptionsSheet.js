import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet from "./BottomSheet";
import AppButton from "./AppButton";
import { useLanguage } from "../context/LanguageContext";
import { colors123, fonts, radius, spacing } from "../utils/theme";
import stitchOptionsConfig from "../configs/stitchOptionsConfig";

// Map outfit type IDs to config keys
const getConfigKey = (outfitTypeId) => {
  const mapping = {
    // Men's
    'shirt': 'shirt',
    'pants': 'pants',
    'kurta': 'kurta',
    'sherwani': 'sherwani',
    'blazer': 'blazer',
    'mens-suit': 'blazer',
    'waist-coat': 'waistcoat',
    'dhoti': 'dhoti',
    // Women's
    'blouse': 'blouse',
    'lehenga': 'lehenga',
    'kurti': 'kurti',
    'gown': 'gown',
    'saree': 'saree_blouse',
    'women-pants': 'salwar',
    'ladies-suit': 'anarkali',
  };
  return mapping[outfitTypeId] || outfitTypeId;
};

export default function StitchOptionsSheet({
  visible,
  outfitType,
  existingOptions = {},
  onSave,
  onClose,
}) {
  const { t } = useLanguage();
  const [selections, setSelections] = useState(existingOptions);
  const styles = getStyles();  // Get styles from lazy-evaluated cache

  // Get config key from outfit type
  const configKey = getConfigKey(outfitType.id);
  const config = stitchOptionsConfig[configKey];

  useEffect(() => {
    if (visible) {
      setSelections(existingOptions);
    }
  }, [visible, existingOptions]);

  const handleSingleSelect = (sectionKey, option) => {
    setSelections(prev => ({
      ...prev,
      [sectionKey]: option
    }));
  };

  const handleMultiSelect = (sectionKey, option) => {
    const current = selections[sectionKey] || [];
    const isSelected = current.includes(option);

    if (isSelected) {
      setSelections(prev => ({
        ...prev,
        [sectionKey]: current.filter(item => item !== option)
      }));
    } else {
      setSelections(prev => ({
        ...prev,
        [sectionKey]: [...current, option]
      }));
    }
  };

  const handleCounterChange = (sectionKey, delta) => {
    const current = selections[sectionKey] || 0;
    const newValue = Math.max(0, current + delta);
    setSelections(prev => ({
      ...prev,
      [sectionKey]: newValue
    }));
  };

  const handleToggle = (sectionKey) => {
    const current = selections[sectionKey] || false;
    setSelections(prev => ({
      ...prev,
      [sectionKey]: !current
    }));
  };

  const handleSave = () => {
    onSave(selections);
  };

  const renderSection = (section) => {
    const { key, label, type, options } = section;
    const currentValue = selections[key];

    switch (type) {
      case "single":
        return (
          <View key={key} style={styles.section}>
            <Text style={styles.sectionTitle}>{label}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.optionsScroll}
            >
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionChip,
                    currentValue === option && styles.optionChipSelected,
                  ]}
                  onPress={() => handleSingleSelect(key, option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      currentValue === option && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case "multi":
        return (
          <View key={key} style={styles.section}>
            <Text style={styles.sectionTitle}>{label}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.optionsScroll}
            >
              {options.map((option) => {
                const isSelected = (currentValue || []).includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionChip,
                      isSelected && styles.optionChipSelected,
                    ]}
                    onPress={() => handleMultiSelect(key, option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        );

      case "counter":
        return (
          <View key={key} style={styles.section}>
            <Text style={styles.sectionTitle}>{label}</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => handleCounterChange(key, -1)}
              >
                <Ionicons name="remove" size={20} color={colors123.primary} />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{currentValue || 0}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => handleCounterChange(key, 1)}
              >
                <Ionicons name="add" size={20} color={colors123.primary} />
              </TouchableOpacity>
            </View>
          </View>
        );

      case "toggle":
        return (
          <View key={key} style={styles.section}>
            <Text style={styles.sectionTitle}>{label}</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleChip,
                  !currentValue && styles.toggleChipSelected,
                ]}
                onPress={() => handleToggle(key)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    !currentValue && styles.toggleTextSelected,
                  ]}
                >
                  {t("no")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleChip,
                  currentValue && styles.toggleChipSelected,
                ]}
                onPress={() => handleToggle(key)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    currentValue && styles.toggleTextSelected,
                  ]}
                >
                  {t("yes")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (!config) {
    return (
      <BottomSheet
        visible={visible}
        title={t("stitchOptions")}
        onClose={onClose}
      >
        <View style={styles.noConfigContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color={colors123.textSoft}
          />
          <Text style={styles.noConfigText}>
            {t("noStitchOptions")}
          </Text>
          <AppButton
            title={t("close")}
            onPress={onClose}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      visible={visible}
      title={`${config.label} ${t("stitchOptions")}`}
      subtitle={t("customizeStitchPreferences")}
      onClose={onClose}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {config.sections.map(renderSection)}

        <View style={styles.actions}>
          <AppButton
            title={t("saveOptions")}
            onPress={handleSave}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

// Create styles lazily to avoid module loading order issues with Hermes
let cachedStyles = null;
const getStyles = () => {
  if (!cachedStyles) {
    cachedStyles = StyleSheet.create({
      container: {
        flex: 1,
      },
      content: {
        padding: spacing.lg,
      },
      noConfigContainer: {
        padding: spacing.xl,
        alignItems: "center",
      },
      noConfigText: {
        fontSize: 16,
        color: colors123.textSoft,
        textAlign: "center",
        marginTop: spacing.md,
      },
      section: {
        marginBottom: spacing.lg,
      },
      sectionTitle: {
        fontSize: 16,
        fontFamily: fonts.semibold,
        color: colors123.text,
        marginBottom: spacing.md,
      },
      optionsScroll: {
        marginHorizontal: -spacing.lg,
        paddingHorizontal: spacing.lg,
      },
      optionChip: {
        backgroundColor: colors123.surface,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors123.border,
      },
      optionChipSelected: {
        backgroundColor: colors123.primary,
        borderColor: colors123.primary,
      },
      optionText: {
        fontSize: 14,
        color: colors123.text,
        fontFamily: fonts.medium,
      },
      optionTextSelected: {
        color: colors123.white,
      },
      counterContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors123.surface,
        borderRadius: radius.lg,
        padding: spacing.sm,
      },
      counterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors123.background,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors123.border,
      },
      counterValue: {
        fontSize: 18,
        fontFamily: fonts.semibold,
        color: colors123.text,
        marginHorizontal: spacing.lg,
        minWidth: 30,
        textAlign: "center",
      },
      toggleContainer: {
        flexDirection: "row",
        gap: spacing.sm,
      },
      toggleChip: {
        flex: 1,
        backgroundColor: colors123.surface,
        borderRadius: radius.lg,
        paddingVertical: spacing.md,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors123.border,
      },
      toggleChipSelected: {
        backgroundColor: colors123.primary,
        borderColor: colors123.primary,
      },
      toggleText: {
        fontSize: 16,
        fontFamily: fonts.medium,
        color: colors123.text,
      },
      toggleTextSelected: {
        color: colors123.white,
      },
      actions: {
        marginTop: spacing.xl,
        marginBottom: spacing.lg,
      },
      saveButton: {
        marginTop: spacing.md,
      },
    });
  }
  return cachedStyles;
};
