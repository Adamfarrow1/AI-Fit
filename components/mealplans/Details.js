import React, { useEffect } from 'react';
import { View, Text } from 'react-native';

const DetailsScreen = ({ navigation }) => {

  useEffect(() => {
    const parentNavigator = navigation.getParent('parent');
    const parentTab = navigation.getParent('id');
    if (parentNavigator) {
      parentNavigator.setOptions({
        headerShown: false,
      });
    }
    //fix tab to not show up
    if (parentTab) {
        parentTab.setOptions({
          tabBarVisible: false,
    })};

    return () => {
      if (parentNavigator) {
        parentNavigator.setOptions({
          headerShown: true,
        });
      }

      if (parentTab) {
        parentTab.setOptions({
          tabBarVisible: true,
    })};
    };
  }, [navigation]);

  return (
    <View>
      <Text>Details Screen</Text>
    </View>
  );
};

export default DetailsScreen;
