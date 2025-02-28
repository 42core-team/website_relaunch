'use client'

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { 
  Card, 
  Input, 
  Table,
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  Spinner,
  SortDescriptor
} from '@heroui/react';
import { SearchIcon } from '@/components/icons';
import { getTeamsForEvent, Team } from '@/app/actions/team';
import { getEventById, Event } from '@/app/actions/event';

export default function TeamsPage() {
  const { id: eventId } = useParams();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterValue, setFilterValue] = useState('');
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'name',
    direction: 'ascending'
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Fetch teams
        const teamsData = await getTeamsForEvent(eventId as string);
        setTeams(teamsData);
      } catch (error) {
        console.error('Error fetching teams data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (eventId) {
      fetchData();
    }
  }, [eventId]);

  // Search filter
  const filteredTeams = useMemo(() => {
    if (!filterValue.trim()) return teams;
    
    return teams.filter(team => 
      team.name.toLowerCase().includes(filterValue.toLowerCase()) ||
      (team.repo && team.repo.toLowerCase().includes(filterValue.toLowerCase()))
    );
  }, [teams, filterValue]);

  // Sorting
  const sortedTeams = useMemo(() => {
    if (!sortDescriptor.column) return filteredTeams;
    
    return [...filteredTeams].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof Team];
      const second = b[sortDescriptor.column as keyof Team];
      
      if (first === undefined || second === undefined) return 0;
      
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      
      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [filteredTeams, sortDescriptor]);

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-500" />
            <Input
              className="w-full pl-10"
              placeholder="Search teams..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            />
          </div>
          
          <Table 
            aria-label="Teams table"
            onSortChange={handleSortChange}
            sortDescriptor={sortDescriptor}
          >
            <TableHeader>
              <TableColumn key="name" allowsSorting>Name</TableColumn>
              <TableColumn key="membersCount" allowsSorting>Members</TableColumn>
              <TableColumn key="createdAt" allowsSorting>Created</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No teams found" items={sortedTeams}>
              {(team) => (
                <TableRow key={team.id}>
                  <TableCell>{team.name}</TableCell>
                  <TableCell>{team.membersCount}</TableCell>
                  <TableCell>
                    {team.createdAt ? new Date(team.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
} 