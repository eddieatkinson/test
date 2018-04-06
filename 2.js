git push -fu origin eaimport React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, TextInput, Alert, Picker } from 'react-native';
import { connect } from 'react-redux';
import { Icon } from 'react-native-elements';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import { Dropdown } from 'react-native-material-dropdown';
import { updateChecklist, getTasks } from '../../redux/actionCreators/taskActionCreators';
import { approve, camera, checklist, map, pastDue, reject, share } from '../../image';
import { backGray, iconGray, darkBlue, offWhite } from '../../utilities';

const styles = {
  container: {
    flexDirection: 'column',
    // height: 0.345 * Dimensions.get('window').width,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderBottomColor: backGray,
    borderBottomWidth: 1,
  },
  info: {
    // flex: 2,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  imageContainerMaster: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  hello
  image: {
    height: '100%',
    width: '100%',
    borderRadius: (0.147 * Dimensions.get('window').width) / 2,
    resizeMode: 'center',
  },
  cameraIcon: {
    height: 20,
    width: 20,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  textInfo: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  topline: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoIcons: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  infoIcon: {
    height: 20,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  bottomBar: {
    height: 0.105 * Dimensions.get('window').width,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: backGray,
    marginBottom: 10,
    shadowOffset: {
      height: 2,
    },
    shadowColor: 'black',
    shadowOpacity: 0.2,
  },
  bottomIcons: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'flex-start',
  },
  progress: {
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'flex-end',
    paddingRight: 20,
  },
  iconArray: {
    resizeMode: 'center',
  },
};

class ChecklistCard extends Component {
  state = {
    value: null,
    disabled: false,
  }

  componentWillMount() {
    if (this.props.locksOnToggle && this.props.status) {
      this.setState({
        disabled: true,
      });
    }
    if (this.props.field) {
      this.setState({
        value: this.props.field.value,
      });
    }
  }

  checkUniqueness(value) {
    const { checklistInstances, masterId, instanceId, itemId } = this.props;
    let isUnique = true;
    checklistInstances.map((instance) => {
      if (instance.id !== instanceId && instance.checklist_master_id === masterId) {
        instance.checklist_items.map((item) => {
          if (item.id === itemId) {
            if (this.state.value && item.field.value === this.state.value) {
              Alert.alert(
                'This entry must be unique',
                '',
                [
                  { text: 'OK' },
                ],
              );
              isUnique = false;
            }
          }
        });
      }
    });
    if (isUnique) {
      this.updateChecklist(value);
    }
  }

  updateChecklist(value) {
    // console.log(value, itemId, this.props.itemId);
    const { instanceId, currentVersionId, itemId } = this.props;
    const updates = {
      checklistId: instanceId,
      versionId: currentVersionId,
      id: itemId,
      status: value,
      value: this.state.value,
    };
    this.props.updateChecklist(updates);
  }

  handleSelection(value) {
    const { currentVersionId, instanceId, field, locksOnToggle, itemId, generatesChild, taskId, taskUuid, itemUuid, navigation } = this.props;
    if (locksOnToggle) {
      this.setState({
        disabled: true,
      });
    }
    if (generatesChild) {
      if (value === 'no') {
        Alert.alert(
          'Selecting "No" on this step will create a new Service Request out of the existing step',
          '',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'OK',
              onPress: () => {
                // console.log(taskId, taskUuid, itemUuid);
                navigation.navigate('CreateTask', {
                  fromChecklist: true,
                  taskId,
                  taskUuid,
                  itemUuid,
                });
              },
            },
          ],
        );
      } else {
        this.updateChecklist(value);
      }
    } else {
      let updates;
      if (field) {
        if (field.required && !this.state.value) {
          // console.log('You need to fill the field!');
          Alert.alert(
            'You must fill in the form.',
            '',
            [
              { text: 'OK' },
            ],
          );
        } else if (field.regex) {
          // const newRegex = field.regex.replace(/\//g, '');
          // const regexToBeUsed = new RegExp(newRegex);
          const regexToBeUsed = new RegExp(field.regex);
          if (this.state.value) {
            if (!this.state.value.match(regexToBeUsed)) {
              console.log('Value must contain numbers');
              if (field.regex === '/[0-9]/') {
                // const messageObject = 'numbers';
                Alert.alert(
                  'Value must be in format "/number/"',
                  '',
                  [
                    { text: 'OK' },
                  ],
                );
              }
            } else {
              this.updateChecklist(value);
            }
          } else {
            this.updateChecklist(value);
          }
        } else if (field.unique) {
          console.log(`this must be unique: ${this.state.value}`);
          this.checkUniqueness(value);
        } else {
          this.updateChecklist(value);
        }
      } else {
        this.updateChecklist(value);
      }
    }
  }

  handleDropdown(value) {
    this.setState({
      value,
    });
  }

  handleFieldInput(sentValue) {
    let value = sentValue.trim();
    if (value === '') {
      value = null;
    }
    console.log(value);
    this.setState({
      value,
    });
  }

  handlePressAttachment() {
    let ending = '';
    const { fileIds, files } = this.props
    if (fileIds.length > 1) {
      ending = 's';
    }
    console.log(`You have ${fileIds.length} attachment${ending}`);
    this.props.navigation.navigate('Attachments', {
      fromCard: true,
      title: `Attachment${ending}`,
      fileIds,
      files,
    });
  }

  render() {
    // console.log('rendering......');
    // console.log(this.state);
    // console.log(this.props);
    const { field, files, fileIds, itemId, status, locksOnToggle, masterId } = this.props;
    // console.log(`masterId: ${masterId}`);
    // console.log(status);
    // console.log(files);
    // console.log(fileIds);
    // console.log(this.state.value);

    // console.log(`status: ${status}`);
    let radioOnPress = value => this.handleSelection(value);
    if (locksOnToggle) {
      // if (status) {
      //   // console.log('Status is here');
      //   this.setState({
      //     disabled: true,
      //   });
      // }
      radioOnPress = value => {
        Alert.alert(
          'Once selected, this step will be locked in place.',
          '',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Submit', onPress: () => this.handleSelection(value) },
          ],
        );
      };
    }
    if (field) {
      if (field.required && !this.state.value) {
        radioOnPress = () => {
          Alert.alert(
            'You must fill in the form.',
            '',
            [
              { text: 'OK' },
            ],
          );
        };
      }
    }

    let selectOptions;
    let initialValue = -1;
    let numberOfAttachments;
    let disabledIcon = true;
    if (fileIds.length > 0) {
      disabledIcon = false;
      numberOfAttachments = (
        <View style={{ position: 'absolute', right: 0, top: -2, backgroundColor: 'red', height: 10, width: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: offWhite, fontSize: 10, fontWeight: '700' }}>{fileIds.length}</Text>
        </View>
      );
    }
    if (field) {
      if (field.options) {
        // let selectedValue = this.state.value;
        selectOptions = (
          <Picker selectedValue={this.state.value} onValueChange={value => this.handleFieldInput(value)}>
            {
              field.options.map((option, index) => {
                return (
                  <Picker.Item key={index} label={option.label} value={option.value} />
                );
              })
            }
          </Picker>
          // <Dropdown
          //   label='Select one'
          //   data={field.options}
          //   onChangeText={value => this.handleFieldInput(value)}
          // />
        );
      } else {
        selectOptions = <TextInput
          style={{ borderColor: iconGray, borderWidth: 0.5, height: 40, marginVertical: 15 }}
          multiline
          onChangeText={text => this.handleFieldInput(text)}
          placeholder={field.value}
          value={this.state.value}
        />;
      }
    }
    return (
      <View style={styles.container}>
        <View style={styles.info}>
          <View style={styles.textInfo}>
            <Text style={{ fontSize: 18, flex: 1, color: iconGray, margin: 20 }}>
              {`${this.props.number}. ${this.props.title}`}
            </Text>
            <View style={{ marginHorizontal: 25 }}>
              <RadioForm
                radio_props={[
                  {
                    label: 'Yes',
                    value: 'yes',
                  },
                  {
                    label: 'No',
                    value: 'no',
                  },
                ]}

                // value={status}
                initial={status === 'yes' ? 0 : status === 'no' ? 1 : -1}
                onPress={radioOnPress}
                buttonColor={darkBlue}
                accessible={false}
                // buttonInnerColor={darkBlue}
                selectedButtonColor={darkBlue}
                labelColor={darkBlue}
                formHorizontal
                disabled={this.state.disabled}
                // style={{ marginHorizontal: 10 }}
                labelStyle={{ marginRight: 25, marginLeft: 0 }}
                buttonStyle={{ margin: 0, padding: 0 }}
              />
              {selectOptions}
            </View>
            <Text style={{ flex: 1 }}>
            </Text>
          </View>
        </View>
        <View style={styles.bottomBar}>
          <View style={styles.bottomIcons}>
            <TouchableOpacity
              disabled={disabledIcon}
              onPress={this.handlePressAttachment.bind(this)}
            >
              <Icon
                name='attach-file'
                color={iconGray}
              />
              {numberOfAttachments}
            </TouchableOpacity>
          </View>
          <View style={styles.progress}>
            <Text style={{ fontSize: 12 }}></Text>
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  // tasks: state.tasks.tasks,
  checklistIsGettingUpdated: state.tasks.checklistIsGettingUpdated,
  checklistInstances: state.tasks.checklistInstances,
});

const mapDispatchToProps = dispatch => ({
  updateChecklist: params => dispatch(updateChecklist(params)),
  getTasks: () => dispatch(getTasks()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChecklistCard);
