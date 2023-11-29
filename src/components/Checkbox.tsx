import { useEffect, useState } from "react";

const CheckBox = (props: any) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheck = (e: any) => {
    const { setSelected, selected } = props;
    if (isChecked) {
      const filteredUsers = selected.filter((user: any) => String(user) !== e.target.id);

      setSelected(filteredUsers);
    } else {
      setSelected([...selected, e.target.id]);
    }

    setIsChecked(!isChecked);
  };

  useEffect(() => {
    setIsChecked(props.isChecked);
  }, [props.isChecked]);

  return (
    <>
      <input id={props.id} checked={isChecked} type="checkbox" onChange={handleCheck} />
    </>
  );
};

export default CheckBox;
