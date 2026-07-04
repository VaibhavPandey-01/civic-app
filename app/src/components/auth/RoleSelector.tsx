import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Shield, User, LucideIcon } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

type Role = 'citizen' | 'admin';

interface RoleSelectorProps {
  selectedRole: Role;
  onRoleChange: (role: Role) => void;
}

interface Option {
  role: Role;
  label: string;
  Icon: LucideIcon;
}

const OPTIONS: Option[] = [
  { role: 'citizen', label: "I'm a Citizen", Icon: User },
  { role: 'admin', label: "I'm an Authority", Icon: Shield },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onRoleChange,
}) => {
  return (
    <View style={styles.container}>
      {OPTIONS.map(({ role, label, Icon }) => {
        const isActive = selectedRole === role;
        return (
          <TouchableOpacity
            key={role}
            style={[styles.segment, isActive && styles.segmentActive]}
            onPress={() => onRoleChange(role)}
            activeOpacity={0.8}
          >
            <Icon
              size={16}
              color={isActive ? Colors.white : Colors.grayText}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: Colors.radius.md,
    padding: 4,
    marginBottom: Colors.spacing.lg,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Colors.spacing.sm,
    borderRadius: Colors.radius.sm,
  },
  segmentActive: {
    backgroundColor: Colors.primaryBlue,
    // subtle shadow to lift the active pill
    shadowColor: Colors.primaryBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.grayText,
  },
  labelActive: {
    color: Colors.white,
  },
});
