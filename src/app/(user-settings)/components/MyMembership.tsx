import React from "react";
import Image from "next/image";
import { membershipCardConfig } from "@/infrastructure/config/membershipCard";
import { UserMembership } from "@/application/types";

interface MyMembershipProps {
  userMembership: UserMembership;
}

export const MyMembership = ({ userMembership }: MyMembershipProps) => {
  // Get the membership data based on the mock user's plan type
  const membershipData = membershipCardConfig[userMembership.planType];

  return (
    <div
      className={`flex flex-col justify-between items-center w-xs ${membershipData.bgColor} p-7 rounded-lg h-[520px] font-mono text-white md:w-[520px] md:h-[320px]`}
    >
      <div className="h-full flex flex-col md:flex-row md:w-full">
        <section className="flex flex-col mx-auto  md:text-left text-center">
          <h3 className="uppercase text-2xl font-bold ">WORK FROM COFFEE</h3>
          <p className="text-[10px] tracking-tighter">
            {membershipData.description}
          </p>
        </section>
        <section className="m-auto flex-1 flex items-center justify-center size-40 md:justify-end">
          <Image
            src={membershipData.image}
            alt="Membership"
            width={168}
            height={168}
          />
        </section>
      </div>
      <section className="flex flex-col gap-3 w-full">
        {/* Name */}
        <h4 className="text-lg font-bold uppercase truncate">
          {userMembership.name}
        </h4>
        {/* Info */}
        <div className="text-xs flex justify-between md:justify-start md:gap-12">
          <div className="flex flex-col gap-2">
            <div>
              <h6>{membershipData.title}</h6>
              <p className="font-bold uppercase">{membershipData.tier}</p>
            </div>
            <div>
              <h6>Value:</h6>
              <p className="font-bold ">{membershipData.price}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <h6>Issued:</h6>
              <p className="font-bold ">{userMembership.issuedDate}</p>
            </div>
            <div>
              <h6>Expires:</h6>
              <p className="font-bold ">{userMembership.expiresDate}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
