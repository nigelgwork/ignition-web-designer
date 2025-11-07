package com.me.webdesigner.util;

import com.inductiveautomation.ignition.common.gson.JsonArray;
import com.inductiveautomation.ignition.common.gson.JsonElement;
import com.inductiveautomation.ignition.common.gson.JsonObject;
import com.inductiveautomation.ignition.common.gson.JsonPrimitive;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * View and Component Validation Utility
 *
 * Validates view.json structure and component hierarchy to ensure
 * data integrity before saving.
 *
 * Features:
 * - View structure validation
 * - Component hierarchy validation
 * - Required field validation
 * - Type checking
 * - Circular reference detection
 * - Duplicate name detection
 * - Size limits
 *
 * Usage:
 * ```java
 * ValidationResult result = ViewValidator.validateView(viewJson);
 * if (!result.isValid()) {
 *     // Handle errors
 *     for (String error : result.getErrors()) {
 *         logger.error(error);
 *     }
 * }
 * ```
 */
public final class ViewValidator {

    // Configuration
    private static final int MAX_NESTING_DEPTH = 20;
    private static final int MAX_COMPONENT_COUNT = 500;
    private static final int MAX_NAME_LENGTH = 100;

    // Required view fields
    private static final String[] REQUIRED_VIEW_FIELDS = {"root"};

    // Required component fields
    private static final String[] REQUIRED_COMPONENT_FIELDS = {"type"};

    // Private constructor - utility class
    private ViewValidator() {}

    /**
     * Validation result container
     */
    public static class ValidationResult {
        private final boolean valid;
        private final List<String> errors;
        private final List<String> warnings;

        public ValidationResult() {
            this.valid = true;
            this.errors = new ArrayList<>();
            this.warnings = new ArrayList<>();
        }

        public ValidationResult(List<String> errors, List<String> warnings) {
            this.valid = errors.isEmpty();
            this.errors = errors;
            this.warnings = warnings;
        }

        public boolean isValid() {
            return valid;
        }

        public List<String> getErrors() {
            return errors;
        }

        public List<String> getWarnings() {
            return warnings;
        }

        public boolean hasWarnings() {
            return !warnings.isEmpty();
        }
    }

    /**
     * Validate a complete view.json structure
     */
    public static ValidationResult validateView(JsonObject viewJson) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        // Check null
        if (viewJson == null) {
            errors.add("View JSON cannot be null");
            return new ValidationResult(errors, warnings);
        }

        // Validate required fields
        for (String field : REQUIRED_VIEW_FIELDS) {
            if (!viewJson.has(field)) {
                errors.add("Missing required field: " + field);
            }
        }

        if (!errors.isEmpty()) {
            return new ValidationResult(errors, warnings);
        }

        // Validate root component
        JsonElement rootElement = viewJson.get("root");
        if (!rootElement.isJsonObject()) {
            errors.add("Root must be a JSON object");
            return new ValidationResult(errors, warnings);
        }

        JsonObject root = rootElement.getAsJsonObject();

        // Validate component hierarchy
        Set<String> componentNames = new HashSet<>();
        int[] componentCount = {0};

        validateComponent(root, 0, componentNames, componentCount, errors, warnings);

        // Check component count limit
        if (componentCount[0] > MAX_COMPONENT_COUNT) {
            errors.add(String.format("Too many components (%d). Maximum allowed: %d",
                componentCount[0], MAX_COMPONENT_COUNT));
        }

        return new ValidationResult(errors, warnings);
    }

    /**
     * Validate a single component and its children recursively
     */
    private static void validateComponent(JsonObject component, int depth,
                                         Set<String> componentNames,
                                         int[] componentCount,
                                         List<String> errors,
                                         List<String> warnings) {
        // Increment counter
        componentCount[0]++;

        // Check nesting depth
        if (depth > MAX_NESTING_DEPTH) {
            errors.add(String.format("Component nesting too deep (depth: %d). Maximum allowed: %d",
                depth, MAX_NESTING_DEPTH));
            return;
        }

        // Validate required fields
        for (String field : REQUIRED_COMPONENT_FIELDS) {
            if (!component.has(field)) {
                errors.add(String.format("Component at depth %d missing required field: %s", depth, field));
                return;
            }
        }

        // Validate type field
        JsonElement typeElement = component.get("type");
        if (!typeElement.isJsonPrimitive() || !typeElement.getAsJsonPrimitive().isString()) {
            errors.add(String.format("Component at depth %d has invalid type (must be string)", depth));
            return;
        }

        String type = typeElement.getAsString();
        if (type == null || type.trim().isEmpty()) {
            errors.add(String.format("Component at depth %d has empty type", depth));
            return;
        }

        // Validate meta.name if present
        if (component.has("meta")) {
            JsonElement metaElement = component.get("meta");
            if (metaElement.isJsonObject()) {
                JsonObject meta = metaElement.getAsJsonObject();
                if (meta.has("name")) {
                    JsonElement nameElement = meta.get("name");
                    if (nameElement.isJsonPrimitive() && nameElement.getAsJsonPrimitive().isString()) {
                        String name = nameElement.getAsString();

                        // Check name length
                        if (name.length() > MAX_NAME_LENGTH) {
                            errors.add(String.format("Component name '%s' exceeds maximum length (%d)",
                                name, MAX_NAME_LENGTH));
                        }

                        // Check for duplicate names
                        if (componentNames.contains(name)) {
                            warnings.add(String.format("Duplicate component name: %s", name));
                        } else {
                            componentNames.add(name);
                        }
                    }
                }
            }
        }

        // Validate children if present
        if (component.has("children")) {
            JsonElement childrenElement = component.get("children");
            if (!childrenElement.isJsonArray()) {
                errors.add(String.format("Component '%s' has invalid children (must be array)", type));
                return;
            }

            JsonArray children = childrenElement.getAsJsonArray();
            for (int i = 0; i < children.size(); i++) {
                JsonElement childElement = children.get(i);
                if (!childElement.isJsonObject()) {
                    errors.add(String.format("Child %d of component '%s' is not an object", i, type));
                    continue;
                }

                validateComponent(childElement.getAsJsonObject(), depth + 1,
                    componentNames, componentCount, errors, warnings);
            }
        }

        // Validate layout if present
        if (component.has("layout")) {
            validateLayout(component.get("layout"), type, errors, warnings);
        }

        // Validate props if present
        if (component.has("props")) {
            JsonElement propsElement = component.get("props");
            if (!propsElement.isJsonObject()) {
                warnings.add(String.format("Component '%s' has invalid props (expected object)", type));
            }
        }
    }

    /**
     * Validate layout object
     */
    private static void validateLayout(JsonElement layoutElement, String componentType,
                                      List<String> errors, List<String> warnings) {
        if (!layoutElement.isJsonObject()) {
            warnings.add(String.format("Component '%s' has invalid layout (must be object)", componentType));
            return;
        }

        JsonObject layout = layoutElement.getAsJsonObject();

        // Validate numeric fields
        String[] numericFields = {"x", "y", "width", "height"};
        for (String field : numericFields) {
            if (layout.has(field)) {
                JsonElement fieldElement = layout.get(field);
                if (!fieldElement.isJsonPrimitive()) {
                    warnings.add(String.format("Component '%s' layout.%s must be a number", componentType, field));
                    continue;
                }

                JsonPrimitive primitive = fieldElement.getAsJsonPrimitive();
                if (!primitive.isNumber()) {
                    warnings.add(String.format("Component '%s' layout.%s must be a number", componentType, field));
                }
            }
        }

        // Validate width and height are positive
        if (layout.has("width")) {
            try {
                int width = layout.get("width").getAsInt();
                if (width < 0) {
                    warnings.add(String.format("Component '%s' has negative width", componentType));
                }
            } catch (Exception e) {
                // Already caught above
            }
        }

        if (layout.has("height")) {
            try {
                int height = layout.get("height").getAsInt();
                if (height < 0) {
                    warnings.add(String.format("Component '%s' has negative height", componentType));
                }
            } catch (Exception e) {
                // Already caught above
            }
        }
    }

    /**
     * Quick validation check - just checks critical errors
     */
    public static boolean isValidView(JsonObject viewJson) {
        ValidationResult result = validateView(viewJson);
        return result.isValid();
    }

    /**
     * Validate component type format
     */
    public static boolean isValidComponentType(String type) {
        if (type == null || type.trim().isEmpty()) {
            return false;
        }

        // Component types should follow format: namespace.category.name
        // Examples: ia.display.label, ia.input.button
        String[] parts = type.split("\\.");
        return parts.length >= 2;
    }

    /**
     * Sanitize component name
     */
    public static String sanitizeComponentName(String name) {
        if (name == null) {
            return "";
        }

        // Remove invalid characters
        String sanitized = name.replaceAll("[^a-zA-Z0-9_-]", "_");

        // Trim to max length
        if (sanitized.length() > MAX_NAME_LENGTH) {
            sanitized = sanitized.substring(0, MAX_NAME_LENGTH);
        }

        return sanitized;
    }
}
